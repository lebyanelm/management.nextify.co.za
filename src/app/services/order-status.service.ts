import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BranchService } from './branch.service';
import { LoaderService } from './loader.service';
import { SocketsService } from './sockets.service';
import * as superagent from 'superagent';
import { ToastService } from './toast.service';
import { Http2ServerResponse } from 'http2';

@Injectable({
  providedIn: 'root'
})
export class OrderStatusService {
  constructor(
    private loader: LoaderService,
    private sockets: SocketsService,
    private branch: BranchService,
    private toast: ToastService
  ) { }

  update(orderIds: string[], status: number = 2, isStepBack = true) {
    return new Promise((resolve, reject) => {
      this.loader.showLoader(true);
      if (orderIds.length === 0) {
        // Determine whether to bring the order down or up
        const orderStatusToFlag = isStepBack ? status - 1 : status + 1;

        this.sockets.data.orders[this.branch.id].forEach((order) => {
          if (order.status === orderStatusToFlag) {
            orderIds.push(order.id);
          }
        });
      }

      if (orderIds.length) {
        superagent
        .post(environment.backendServer + '/order/status')
        .set('Authorization', this.sockets.data.token)
        .send({orderIds, status, branchId: this.branch.id})
        .end((error, response) => {
          this.loader.showLoader(false);
          if (response) {
            if (response.status === 200) {
              for (const orderId of orderIds) {
                for (let index = 0; index < this.sockets.data.orders[this.branch.id].length; index++) {
                  if (this.sockets.data.orders[this.branch.id][index].id === orderId) {
                    this.sockets.data.orders[this.branch.id][index].status = status;
                    if (status === 4) {
                      if (!this.sockets.data.completedOrders) {
                        this.sockets.data.completedOrders = {};
                      }

                      if (!this.sockets.data.completedOrders[this.branch.id]) {
                        this.sockets.data.completedOrders[this.branch.id] = [];
                      }

                      // tslint:disable-next-line: max-line-length
                      this.sockets.data.completedOrders[this.branch.id].push(this.sockets.data.orders[this.sockets.data.orders[this.branch.id][index]]);
                      this.sockets.data.orders[this.branch.id].splice(index, 1);
                    }
                    break;
                  }
                }
              }
              resolve();
            } else {
              this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
              reject();
            }
          } else {
            this.toast.show(response.body.reason || 'ERROR: NO INTERNET CONNECTION.');
            reject();
          }
        });
      } else {
        this.loader.showLoader(false);
        resolve();
      }
    });
  }

  // Clearing the orders from the stack of the connected branch
  clearAllOrders() {
    this.loader.showLoader(true);

    superagent
      .delete([environment.backendServer, 'orders'].join('/'))
      .set('Authorization', this.sockets.data.token)
      .send({ branchId: this.branch.id })
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((_, response) => {
        this.loader.showLoader(false);
        if (response) {
          if (response.status === 200) {
            // Sync the changes made in the server with the locally loaded data
            if (this.sockets.data.orders[this.branch.id]) {
              delete this.sockets.data.orders[this.branch.id];
            }
          } else {
            this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
          }
        } else {
          this.toast.show('ERROR: NO INTERNET CONNECTION.');
        }
      });
  }

  // Remove a single order from the stack, also notify the customer about cancelation of the order
  cancelOrder(orderId: string): Promise<superagent.Response> {
    return new Promise((resolve, reject) => {
      this.loader.showLoader(true);

      superagent
        .delete([environment.backendServer, 'order'].join('/'))
        .set('Authorization', this.sockets.data.token)
        .send({ orderId, branchId: this.branch.id })
        .on('progress', (event) => this.loader.pipe(event.percent))
        .end((_, response) => {
          if (response) {
            if (response.status === 200) {
              const orderIndex = this.sockets.data.orders[this.branch.id].findIndex((o) => o.id === orderId);
              this.sockets.data.orders[this.branch.id].splice(orderIndex, 1);

              resolve(response);
            } else {
              this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
              reject(response);
            }
          } else {
            this.toast.show('ERROR: NO INTERNET CONNECTION');
          }
          this.loader.showLoader(false);
        });
    });
  }
}
