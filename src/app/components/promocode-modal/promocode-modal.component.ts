import { ToastService } from './../../services/toast.service';
import { SocketsService } from 'src/app/services/sockets.service';
import { ModalController } from '@ionic/angular';
import { LoaderService } from './../../services/loader.service';
import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { timer } from 'rxjs';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-promocode-modal',
  templateUrl: './promocode-modal.component.html',
  styleUrls: ['./promocode-modal.component.scss'],
})
export class PromocodeModalComponent implements OnInit, AfterViewInit {
  isLoading = false;
  isLoadingComplete = false;
  isError = false;
  error = '';

  data = { id: null, code: '', discount: '', usage: 0, ends: '' };
  unEdited;
  constructor(
    private loader: LoaderService,
    private modalCtrl: ModalController,
    private sockets: SocketsService,
    private toast: ToastService
  ) { }

  ngAfterViewInit() {
    this.loader.state.subscribe((state) => {
      if (state.isModal) {
        this.backdropDismiss(!state.state);
        if (state.state) {
          this.isLoading = true;
        } else {
          this.isLoadingComplete = true;
          timer(500)
            .subscribe(() => {
              this.isLoading = false;
              this.isLoadingComplete = false;
              this.modalCtrl.dismiss();
            });
        }
      }
    });
  }

  ngOnInit() {
    if (this.data.id) {
      // Make a copy of the original passed promocode
      let copy: any = {};
      for (let property in this.data) {
        copy[property] = this.data[property];
      }

      this.data = copy;

      // Assign this to an Non-Changable promocode to compare with later on
      this.unEdited = {};
      for (let property in this.data) {
        this.unEdited[property] = this.data[property];
      }
    }
  }
  
  createPromocode() {
    this.isLoading = true;
    superagent
      .post(environment.backendServer + '/promocode?partnerId=' + this.sockets.data.id)
      .send({...this.data, token: this.sockets.data.token})
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        this.isLoading = false;
        if (response) {
          if (response.status === 208) {
            this.toast.show('Promocode already exists.');
          } else if (response.status === 200) {
            this.modalCtrl.dismiss();
            this.sockets.data.promocodes.push(response.body.promocode);
            this.toast.show('Promocode created.');
          } else {
            this.toast.show(response.body.reason || 'Something went wrong.');
          }
        } else {
          this.toast.show('You\'re not connected.');
        }
      });
  }

  editPromocode() {
    const changes = this.getChanges();
    superagent
      .patch(environment.backendServer + '/promocode')
      .set('Authorization', this.sockets.data.token)
      .send({...changes, id: this.data.id})
      .end((_, response) => {
        if (response) {
          if (response.status === 200) {
            this.toast.show('SUCCESS: PROMOCODE EDITED.')
            for (let property in changes) {
              this.data[property] = changes[property];
            }
            this.modalCtrl.dismiss(this.data);
          } else {
            this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG');
          }
        } else {
          this.toast.show('ERROR: YOU\'RE NOT CONNECTED TO THE INTERNET.');
        }
      });
  }

  getChanges() {
    const changes = {};
    for (let property in this.unEdited) {
      if (this.unEdited[property] !== this.data[property]) {
        changes[property] = this.data[property];
      }
    }

    return changes;
  }
  
  backdropDismiss(state) {
    this.modalCtrl.getTop()
      .then((modal) => {
        modal.backdropDismiss = state;
      });
  }
}
