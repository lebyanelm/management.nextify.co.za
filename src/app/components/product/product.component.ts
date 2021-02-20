import { Section } from './../../interfaces/Section';
import { TimeCreated } from './../../interfaces/TimeCreated copy';
import { IonRangeValue } from './../../interfaces/IonRangeValue';
import { ToastService } from './../../services/toast.service';
import { SocketsService } from 'src/app/services/sockets.service';
import { LoaderService } from './../../services/loader.service';
import { ImageViewComponent } from './../image-view/image-view.component';
import { ProductModalComponent } from './../../components/product-modal/product-modal.component';
import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';
import { Extra } from 'src/app/interfaces/Extra';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  @Input() id: string;
  @Input() name: string;
  @Input() price: string;
  @Input() category: string;
  @Input() description: string;
  @Input() buys: any;
  @Input() views: any;
  @Input() extras: any[];
  @Input() branches: any[];
  @Input() images: string[];
  @Input() expectedPrepareTime: IonRangeValue;
  @Input() noRequiredSides: IonRangeValue;
  @Input() dietary: string;
  @Input() timeCreated: TimeCreated;
  @Input() inStock: boolean;
  @Input() sides: string[];
  @Input() sections: Section[];

  constructor(
    private modalCtrl: ModalController,
    private loader: LoaderService,
    private sockets: SocketsService,
    private toast: ToastService
  ) {
  }

  ngOnInit() {
    // Convert the number to a comma seperated string to certain locales(countries)
    this.buys = this.buys ? this.buys.toLocaleString() : 0;
    this.views = this.views ? this.views.toLocaleString() : 0;
    
    this.extras.forEach((extraId: any, index: number) => {
      const extra = this.sockets.data.extras.find((e) => e.id === extraId);
      if (extra) {
        this.extras[index] = extra;
      } else {
        this.extras.splice(index, 1);
      }
    });

    this.branches.forEach((branchId: any, index: number) => {
      const branch = this.sockets.data.branches.find((b) => b.id === branchId);
      if (branch) {
        this.branches[index] = branch;
      }
    });
  }

  confirmProductDelete() {
    this.toast.showAlert({
      header: 'Confirm',
      message: `Are you sure you want to delete "${this.name}" permenanly?`,
      buttons: [{ text: 'Cancel' }, { text: 'Delete product', cssClass: 'danger-text', handler: () => { this.deleteProduct(); }}]
    });
  }

  deleteProduct() {
    this.loader.showLoader(true);
    superagent
      .delete(environment.backendServer + '/product?partnerId=' + this.sockets.data.id)
      .send({id: this.id, token: this.sockets.data.token})
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        // Hide the loader
        this.loader.showLoader(false);
        if (response) {
          if (response.status === 200 || response.status === 404) {
            for (let index = 0; index < this.sockets.data.products.length; index++) {
              if (this.sockets.data.products[index].id === this.id) {
                this.sockets.data.products.splice(index, 1);
                break;
              }
            }

            // Show an error for an 404 response code
            if (response.status === 404) {
              this.toast.showAlert({
                header: 'Error',
                message: `The product "${this.name}" you are trying to delete, doesn't exist.`,
                buttons: [{text: 'Okay'}, {text: 'Report problem'}]
              });
            }

            // Let the changes be sent over to event listeners
            this.sockets.change.next();
          } else if (response.status === 500) {
            this.toast.showAlert({
              header: 'Internal server error',
              message: `Something unexpected happened. Please report the problem if it persists.`,
              buttons: [{text: 'Okay'}, {text: 'Report problem'}]
            });
          }
        }
      });
  }

  async editProduct() {
    const modal = await this.modalCtrl.create({
      component: ProductModalComponent,
      cssClass: 'modal product-modal',
      componentProps: {
        data: this
      }
    });
    modal.present();
  }

  async openPreviewImages(images: string[], id: string, description: string) {
    this.loader.showLoader(true);
    const modal = await this.modalCtrl.create({
      component: ImageViewComponent,
      componentProps: {
        images,
        productId: id,
        productDescription: description
      }
    });
    modal.present();
  }
}
