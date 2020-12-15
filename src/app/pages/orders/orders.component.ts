import { OrderTranscriptComponent } from './../../components/order-transcript/order-transcript.component';
import { Order } from './../../interfaces/Order';
import { LoaderService } from './../../services/loader.service';
import { ToastService } from './../../services/toast.service';
import { BranchService } from './../../services/branch.service';
import { Partner } from '../../interfaces/Partner';
import { SocketsService } from './../../services/sockets.service';
import { Component, OnInit, ViewChild, AfterViewInit, Input, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IonContent, IonSelect, ModalController } from '@ionic/angular';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements AfterViewInit {
  @ViewChild('IonSelect', {static: false}) ionSelect: IonSelect;
  @ViewChild('OrdersContentContainer', {static: false}) ordersContentContainer: ElementRef<HTMLDivElement>;
  @ViewChild('SearchInput', {static: false}) searchInput: ElementRef<HTMLInputElement>;

  data: Partner;
  isProcessedFocused = false;
  isFullscreen = false;
  searchResults = [];

  constructor(
    public sockets: SocketsService,
    public branch: BranchService,
    private toast: ToastService,
    private loader: LoaderService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController
  ) {
    this.data = sockets.data;
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.onkeyup = () => {
      this.searchResults = [];
      const keyword = this.searchInput.nativeElement.value.toLowerCase();
      if (keyword) {
        if (this.branch.id && this.sockets.data.orders[this.branch.id]) {
          this.sockets.data.orders[this.branch.id].forEach((order: any) => {
            if (order.status !== 4) {
              this.searchScan(order, keyword, order);
            }
          });
        }
      }
    }
  }

  searchScan(object: any, keyword: string, originalOrder: Order) {
    for (let property in object) {
      if (typeof object[property] === 'string' || typeof object[property] === 'number') {
        if (object[property].toString().toLowerCase().includes(keyword)) {
          this.searchResults.push(originalOrder);
          continue;
        }
      } else if (typeof object[property] === 'object') {
        if (object[property] && object[property].constructor === Object) {
          this.searchScan(object[property], keyword, originalOrder);
        } else if (object[property] && object[property].constructor === Array) {
          if (property === 'products' || property === 'sides') {
            object[property].forEach((orderProduct) => {
              const product = this.sockets.data.products.find((p) => p.id === (property === 'products' ? orderProduct.id : orderProduct));
              if (product) {
                this.searchScan(product, keyword, originalOrder);
              }
            });
          } else if (property === 'extras') {
            object[property].forEach((orderExtra) => {
              const extra = this.sockets.data.extras.find((e) => e.id === orderExtra);
              if (extra) {
                this.searchScan(extra, keyword, originalOrder);
              }
            })
          }
        }
      }
    }
  }

  changeOrdersStatus(orderIds: string[], status: number = 2, isStepUp = true) {
    this.loader.showLoader(true);
    if (orderIds.length === 0) {
      // Determine whether to bring the order down or up
      const orderStatusToFlag = isStepUp ? status - 1 : status + 1;

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
                }
              }
            }

            this.cdr.detectChanges();
          } else {
            this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
          }
        }
      });
    } else {
      this.loader.showLoader(false);
    }
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

  async openTranscript(order) {
    const modalCtrl = await this.modalCtrl.create({
      component: OrderTranscriptComponent,
      componentProps: { order },
      cssClass: ['modal', 'order-transcript-modal']
    });

    modalCtrl.present();
  }
}
