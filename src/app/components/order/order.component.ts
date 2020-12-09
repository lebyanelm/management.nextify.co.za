import { ToastService } from './../../services/toast.service';
import { SocketsService } from 'src/app/services/sockets.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  @Input() id: string;
  @Input() uid: string;
  @Input() products: any[];
  @Input() destination: any;
  @Input() totalPrice: string;
  @Input() promocodeUsed: any;
  @Input() extras: string[];
  @Input() coords: {lat: number, lng: number};
  @Input() status: number;
  @Input() customer: string;

  excludedExtras: string[] = [];
  constructor(
    private sockets: SocketsService,
    private toast: ToastService
  ) { }

  ngOnInit() {}

  getExcludedExtras() {
    this.excludedExtras = [];
    this.products.forEach((p) => {
      // const product = this.sockets.data.products.find((_p) => _p.id === p.id),
      //   extras = product.extras;
      // extras.forEach((extra) => {
      //   if (this.extras.indexOf(extra) === -1) {
      //     this.excludedExtras.push(extra);
      //   }
      // });
    });

    if (this.excludedExtras.length) {
      return this.excludedExtras.join(', ');
    } else {
      return '';
    }
  }
  processProduct() {
    this.sockets.connection.emit('processed', {id: this.id, uid: this.uid, destination: this.destination}, (error) => {
      /* Search for the processed item and remove it from index of orders */
      if (!error) {
        for (let index = 0; index < this.sockets.data.orders[this.sockets.branchId].length; index++) {
          if (this.sockets.data.orders[this.sockets.branchId][index].id === this.id) {
            this.sockets.data.orders[this.sockets.branchId][index].status = 2;
            this.sockets.data.completedOrders[this.sockets.branchId].push(this.sockets.data.orders[this.sockets.branchId][index]);
            this.sockets.data.orders[this.sockets.branchId].splice(index, 1);
          }
        }
      } else {
        this.toast.show(error.message);
      }
    });
  }
}
