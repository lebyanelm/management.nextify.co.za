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
    this.loader.showModalLoader(!this.isLoading);
    superagent
      .post(environment.backendServer + '/promocode?partnerId=' + this.sockets.data.id)
      .send({...this.data, token: this.sockets.data.token})
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        if (response) {
          if (response.status === 208) {
            this.isError = true;
            this.toast.show('Promocode already exists.');
            this.loader.showModalLoader(false, true);
          } else if (response.status === 201) {
            this.sockets.data.promocodes.push(response.body);
            this.loader.showModalLoader(false);
            this.toast.show('Promocode created.', {position: 'bottom', buttons: [{text: 'OKAY'}]});
          } else if (response.status === 500) {
            this.isError = true;
            this.toast.showAlert({
              header: 'Unexpected error',
              // tslint:disable-next-line: max-line-length
              message: 'Something went wrong while creating your promocode, we might not know about this error, but you can help us fix it by reporting the problem.',
              buttons: [{text: 'Cancel'}, {text: 'Report Problem', handler: () => { console.log('Reporting problem'); }}]
            });
            this.loader.showModalLoader(false, true);
          }
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
