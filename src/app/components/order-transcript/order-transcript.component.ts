import { SocketsService } from 'src/app/services/sockets.service';
import { Order } from './../../interfaces/Order';
import { Component, OnInit } from '@angular/core';
import { time } from 'console';
import { OrderStatusService } from 'src/app/services/order-status.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-transcript',
  templateUrl: './order-transcript.component.html',
  styleUrls: ['./order-transcript.component.scss'],
})
export class OrderTranscriptComponent implements OnInit {
  order: Order;
  timeElapsed;
  sectionsSelected: any = {};
  products: string[] = [];
  orderStatus: string;
  constructor(
    private sockets: SocketsService,
    public orderStatusService: OrderStatusService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.orderStatus = this.getOrderStatus(this.order.status);
    this.getTimeElapsed(this.order.timeCreated.timestamp);
  }

  getTimeElapsed(timestamp: number): any {
    const timestampNow = Date.now(),
          timestampDifference = timestampNow - timestamp;

    // Convert the timestamp difference milliseconds to hours and minutes
    this.timeElapsed = {
      // Convert the milliseconds to hours
      hours: (timestampDifference / (3.6e+6)).toFixed(0),
      // Get the remainder from the last conversion and convert that to minutes
      minutes: ((timestampDifference % (3.6e+6)) / 60000).toFixed(0)
    };
    
    return this.timeElapsed;
  }

  getOrderStatus(status: number): string {
    let _status: string;
    if (status === 1) {
      _status = 'Order Placed (Unprocessed)';
    } else if (status === 2) {
      _status = 'In Progress (Preparing order)';
    } else if (status === 3) {
      _status = 'In Delivery (Delivering order)';
    } else if (status === 4) {
      _status = 'Delivered (Order completed)';
    }
    return _status;
  }

  getExtraNames(extraIds: string[]): string {
    let extras = '';

    extraIds.forEach((extraId, index) => {
      const extra = this.sockets.data.extras.find((e) => e.id === extraId);
      if (extra) {
        if (index !== 0) {
          extras += ', ';
        }
        extras += extra.name;
      }
    });

    return extras;
  }

  getProductName(productId: string): string {
    return this.order.products.find((p) => p.id === productId).name;
  }

  objectToArray(object: any = {}) {
    const keys = Object.keys(object),
          array = [];

    for (let key of keys) {
      array.push({ name: key.replace(/_/g, ' '), option: object[key] })
    }
    
    return array;
  }

  updateOrderStatus(orderStatus: number): void {
    this.orderStatusService.update([this.order.id], orderStatus)
      .then(() => this.modalCtrl.dismiss());
  }
}
