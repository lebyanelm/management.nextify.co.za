import { ModalController } from '@ionic/angular';
import { SocketsService } from './../../services/sockets.service';
import { ToastService } from './../../services/toast.service';
import { environment } from './../../../environments/environment';
import { LoaderService } from './../../services/loader.service';
import { Extra } from './../../interfaces/Extra';
import { Component, OnInit, Input } from '@angular/core';
import { post, patch } from 'superagent';

@Component({
  selector: 'app-extras-modal',
  templateUrl: './extras-modal.component.html',
  styleUrls: ['./extras-modal.component.scss'],
})
export class ExtrasModalComponent implements OnInit {
  @Input() partnerToken: string;
  @Input() data: Extra = {name: '', price: ''};
  isLoading = false;
  isError = false;
  isLoadingComplete = false;
  error: string;
  changes: any = {};

  constructor(
    private loader: LoaderService,
    private toast: ToastService,
    private sockets: SocketsService,
    private modalCtrl: ModalController
  ) {
  }

  ngOnInit() {
    if (this.data.id) {
      this.changes.name = this.data.name;
      this.changes.price = this.data.price;
    }
  }

  createExtra() {
    this.isLoading = true;
    this.loader.showModalLoader(true);

    const price = parseFloat(this.data.price);
    if (!isNaN(price)) {
      post(environment.backendServer + '/extra')
        .set('Authorization', this.partnerToken)
        .send(this.data)
        .end((error, response) => {
          if (response.status === 200) {
            this.toast.show('Extra succefully created.');
            this.sockets.data.extras.push(response.body.extra);
            this.isLoadingComplete = true;
            this.isLoading = false;
            this.loader.showModalLoader(false);
            this.modalCtrl.dismiss(1);
          } else if (response.status === 500) {
            this.isLoading = true;
            this.loader.showModalLoader(false);
            this.toast.show(response.body.reason || 'Something went wront.');
          }
        });
    } else {
      this.isError = true;
      this.isLoadingComplete = true;
      this.isLoading = false;
      this.loader.showModalLoader(false);
      this.error = 'Price must be a number';
    }
  }

  editExtra() {
    this.isLoading = true;
    this.loader.showModalLoader(true);

    const price = parseFloat(this.data.price);
    if (!isNaN(price)) {
      patch(environment.backendServer + '/extra')
        .set('Authorization', this.sockets.data.token)
        .send({ ...this.changes, extraId: this.data.id })
        .end((error, response) => {
          if (response.status === 200) {
            this.toast.show('Changes succesfully saved.');

            for (const extra of this.sockets.data.extras) {
              if (extra.id === this.data.id) {
                extra.name = this.changes.name;
                extra.price = this.changes.price;
              }
            }

            this.isLoadingComplete = true;
            this.isLoading = false;
            this.loader.showModalLoader(false);
            this.modalCtrl.dismiss(1);
          } else if (response.status === 500) {
            this.isLoading = true;
            this.loader.showModalLoader(false);
            this.toast.show(response.body.reason || 'Something went wront.');
          }
        });
    } else {
      this.isError = true;
      this.isLoadingComplete = true;
      this.isLoading = false;
      this.loader.showModalLoader(false);
      this.error = 'Price must be a number';
    }
  }
}
