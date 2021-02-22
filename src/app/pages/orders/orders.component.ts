import { OrderTranscriptComponent } from 'src/app/components/order-transcript/order-transcript.component';
import { Order } from 'src/app/interfaces/Order';
import { BranchService } from 'src/app/services/branch.service';
import { Partner } from '../../interfaces/Partner';
import { SocketsService } from 'src/app/services/sockets.service';
import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { IonSelect, ModalController } from '@ionic/angular';
import { OrderStatusService } from 'src/app/services/order-status.service';

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
  isGridView = false;
  searchResults = [];

  constructor(
    public sockets: SocketsService,
    public branch: BranchService,
    public orderStatus: OrderStatusService,
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

  async openTranscript(order) {
    const modalCtrl = await this.modalCtrl.create({
      component: OrderTranscriptComponent,
      componentProps: { order },
      cssClass: ['modal', 'order-transcript-modal']
    });

    modalCtrl.present();
  }
}
