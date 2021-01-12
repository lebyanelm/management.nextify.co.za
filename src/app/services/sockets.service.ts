import { BranchService } from './branch.service';
import { Order } from 'src/app/interfaces/Order';
import { StatusService } from './status.service';
import { NotificationService } from './notification.service';
import { ToastService } from './toast.service';
import { StorageService } from './storage.service';
import { Partner } from '../interfaces/Partner';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { connect } from 'socket.io-client';
import { post } from 'superagent';
import { Message } from '../interfaces/Message';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {
  // tslint:disable variable-name
  public data: Partner;
  change: Subject<boolean> = new Subject<boolean>();
  connected: Subject<any> = new Subject<any>();
  connection: SocketIOClient.Socket;
  hasDisconnectedBefore = false;
  branchId: string;
  onMessage: Subject<Message> = new Subject<Message>();
  disconnectedToast;

  isAuthenticated = false;
  isSignedOut = false;
  
  constructor(
      private storage: StorageService,
      private router: Router,
      private toast: ToastService,
      private notifications: NotificationService,
      private status: StatusService
  ) { }
  createConnection() {
    return new Promise((resolve, reject) => {
        this.storage.getItem(environment.PARTNER_DATA_REF, false)
        .then((token) => {
            const io = connect(environment.socketsServer, {
              path: environment.production ? '/partners/socket.io' : '/socket.io',
              query: {
                token,
                type: 'partner'
              },
              upgrade: false,
              transports: ['websocket'] });

            io.on('authenticated', (data) => {
              this.isAuthenticated = true;
              this.isSignedOut = false;
              this.connection = io;
              this.data = {...data, token};
              document.title = 'Nextify for Partners | ' + this.data.businessName;
              
              if (this.disconnectedToast) {
                this.disconnectedToast.dismiss();
                this.disconnectedToast = null;
              }

              if (location.href.includes('accounts') || location.href === location.origin) {
                this.router.navigate(['home']);
              }

              if (!this.status.status && this.hasDisconnectedBefore) {
                post(environment.backendServer + '/status?token=' + this.data.token)
                  .send({ state: false, socketId: this.connection.id })
                  .end((error, response) => {
                    if (response) {
                      if (response.status === 200) {
                        this.status.status = false;
                      }
                    }
                  });
              }

              resolve(this.data);
              this.connected.next(this.connection);
            });

            // When the status of the isOnline changes
            io.on('status', (state) => {
              if (this.isAuthenticated) {
                this.data.isOnline = state;
                this.change.next();
              }
            });

            // Register an event listner to dispatch when the customers place an order
            io.on('order', (order: Order) => {
              if (this.isAuthenticated) {
                if (!this.data.orders) {
                  this.data.orders = {};
                }

                if (!this.data.orders[this.branchId]) {
                  this.data.orders[this.branchId] = [];
                }
                
                this.data.orders[this.branchId].push(order);
                this.notifications.emit();

                // Update the snapshots data
                if (order.paymentMethod === 'cash') {
                  this.data.snapshots.totalEarnings -= order.totalPrice * (25 / 100);
                } else {
                  this.data.snapshots.totalEarnings += order.totalPrice - (order.totalPrice * (25 / 100));
                }
                this.data.snapshots.totalOrders++;
              }
            });

            io.on('ntag', (n) => {
              if (this.isAuthenticated) {
                this.data.snapshots.customerAvg = n;
              }
            });

            // Counts how many drivers are connected to the currently connected branch
            io.on('driver_count', (count: number) => {
              if (this.isAuthenticated) {
                this.notifications.driverConnected(count);
              }
            });

            io.on('processed', (orderId) => {
              if (this.isAuthenticated) {
                for (const index in this.data.orders) {
                  if (this.data.orders[index].id === orderId) {
                    this.data.orders[index].status = 2;
                    this.data.completedOrders.push(this.data.orders[index]);
                    this.data.orders.splice(parseInt(index, 2), 1);
                    break;
                  }
                }
              }
            });

            io.on('message', (message: Message) => {
              if (this.isAuthenticated) {
                this.notifications.message();
                if (!this.data.messages) {
                  this.data.messages = {};
                }

                if (!this.data.messages[this.branchId]) {
                  this.data.messages[this.branchId] = {};
                }

                if (!this.data.messages[this.branchId][message.from]) {
                  this.data.messages[this.branchId][message.from] = [];
                }

                this.data.messages[this.branchId][message.from].push(message);
                this.onMessage.next(message);
              }
            });

            // When updates are made by another connected device
            io.on('data update', (data) => {
              if (this.isAuthenticated) {
                // Replace the older data with the new one
                this.data = { ...data, token: this.data.token };
              }
            });

            io.on('disconnect', () => {
              this.hasDisconnectedBefore = true;
              this.status.status = false;
              this.status.stateChange.next(this.status.status);
              
              // Only show connection error message if partner is still signed in
              if (!this.isSignedOut) {
                this.toast.show('Connection lost, automatically reconnecting...', { buttons: [ {text: 'Okay'} ] })
                  .then((toast) => {
                    this.disconnectedToast = toast;
                  });
              }
            });

            io.on('unauthenticated', (statusCode: number) => {
              if (statusCode === 400) {
                this.toast.showAlert({
                  header: 'Authentication error',
                  message: 'Your connection is not trusted. Please sign in again.',
                  buttons: [{text: 'Sign in again', handler: () => { this.router.navigateByUrl('/signin'); }}],
                  backdropDismiss: false
                });
              } else if (statusCode === 403) {
                this.toast.showAlert({
                  header: 'Authentication error',
                  message: 'You connection signature seems to be invalid or expired. Sign in again to resolve the problem.',
                  buttons: [{text: 'Sign in again', handler: () => { this.router.navigateByUrl('/signin'); }}],
                  backdropDismiss: false
                });
              } else if (statusCode === 404) {
                this.toast.showAlert({
                  header: 'Account not found',
                  message: 'We can\'t seem to find your account. Report this problem if you need assistance.',
                  buttons: [{text: 'Report problem', handler: () => { console.log('Report problem'); }}],
                });
              } else if (statusCode === 500) {
                this.toast.showAlert({
                  header: 'Connection error',
                  message: 'We are experiencing defficulties connecting you to our servers. If problem persists please report it.',
                  buttons: [{text: 'Report problem', handler: () => { console.log('Report problem'); }}],
                  backdropDismiss: false
                });
              }
              reject();
          });
        });
      });
  }

  disconnect() {
    this.isSignedOut = true;
    if (this.connection) {
      this.connection.disconnect();
    }
    this.connection = null;
  }

  restartConnection() {
    this.disconnect();
    this.createConnection()
      .then(() => {
        this.change.next();
      });
  }
}
