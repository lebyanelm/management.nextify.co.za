import { Router } from '@angular/router';
import { StorageService } from './../../services/storage.service';
import { AvatarUploadComponent } from './../../components/avatar-upload/avatar-upload.component';
import { LoaderService } from './../../services/loader.service';
import { ToastService } from './../../services/toast.service';
import { AuthorizationComponent } from './../../components/authorization/authorization.component';
import { ModalController } from '@ionic/angular';
import { interval } from 'rxjs';
import { SocketsService } from './../../services/sockets.service';
import { Component, OnInit } from '@angular/core';
import { Partner } from 'src/app/interfaces/Partner';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  data: Partner;
  updatedData = {
    businessName: '',
    emailAddress: '',
    phoneNumber: '',
    address: '',
    avatar: '',
    deliveryRange: 0,
    isTwoFactorLogin: false
  };

  constructor(
    public sockets: SocketsService,
    private toast: ToastService,
    private modalCtrl: ModalController,
    private loader: LoaderService,
    private storage: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
    const awaiter = interval(500)
      .subscribe(() => {
        if (this.sockets.data) {
          awaiter.unsubscribe();
          this.data = this.sockets.data;
          this.updatedData.isTwoFactorLogin = this.data.isTwoFactorLogin;
          this.updatedData.deliveryRange = this.data.deliveryRange;
        }
      });
  }

  async authorizeAction(isDeleteAccount: boolean = false) {
    console.log(isDeleteAccount)
    const modal = await this.modalCtrl.create({
      component: AuthorizationComponent,
      cssClass: 'modal authorization-modal',
      componentProps: {
        data: {
          id: this.data.id,
          avatar: this.data.media[this.data.media.length - 1] || this.data.media[0],
          emailAddress: this.data.emailAddress }
      }
    });
    modal.onDidDismiss()
      .then((v) => {
        if (v.data === true) {
          if (!isDeleteAccount) {
            this.editAccount();
          } else {
            this.confirmAccountDelete();
          }
        } else if (v.data === false) {
          this.toast.show('Authorization has declined, changes were not saved!');
        }
      });
    modal.present();
  }

  parseFloat(value = '0') {
    return parseFloat(value);
  }

  editAccount() {
    const data = this.updatedData;
    this.loader.showLoader(true);
    // Clean the data and remove parts of the data that have not been filled
    for (const property in data) {
      if (data[property].length === 0) {
        delete data[property];
      }
    }

    superagent
      .patch(environment.backendServer + '/')
      .on('progress', (event) => this.loader.pipe(event.percent))
      .send({...data, token: this.sockets.data.token})
      .end((error, response) => {
        this.loader.showLoader(false);
        console.log(response);
        if (response) {
          if (response.status === 200) {
            // tslint:disable-next-line: forin
            for (const property in data) {
              this.sockets.data[property] = data[property];
              this.data[property] = data[property];
              if (typeof data[property] === 'string') {
                this.updatedData[property] = '';
              }
            }

            // Update the removed default data
            this.updatedData.deliveryRange = data.deliveryRange;
            this.updatedData.isTwoFactorLogin = data.isTwoFactorLogin;

            // Update the title of the page, only if the business name has been changed
            if (data.businessName) {
              document.title = data.businessName;
            }
          }
        }
      });
  }

  confirmAccountDelete() {
    this.loader.showLoader(true);
    this.toast.showAlert({
      header: 'Delete account',
      message: 'Are you sure? You are about to permenantly delete your account. All data will not be recoverable.',
      // tslint:disable-next-line: max-line-length
      buttons: [{ text: 'Cancel', cssClass: 'text-danger', role: 'danger' }, { text: 'Yes, I\'m certain.', handler: () => { this.deleteAccount(); }}]
    }).then(() => this.loader.showLoader(false));
  }

  deleteAccount() {
    this.loader.showLoader(true);
    superagent
      .delete(environment.backendServer + '/')
      .on('progress', (e) => this.loader.pipe(e.percent))
      .set('Authorization', this.sockets.data.token)
      .end((error, response) => {
        this.loader.showLoader(false);
        if (response) {
          if (response.status === 200) {
            this.storage.remove(environment.PARTNER_DATA_REF);
            this.router.navigateByUrl('/signin');
            this.sockets.disconnect();
          } else {
            this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
          }
        } else {
          this.toast.show('ERROR: NO INTERNET CONNECTION.');
        }
      });
  }

  async addNewAvatar() {
    this.loader.showLoader(true);
    const modal = await this.modalCtrl.create({
      component: AvatarUploadComponent,
      cssClass: 'modal avatar-upload',
      componentProps: {
        token: this.sockets.data.token
      }
    });
    modal.onDidDismiss()
      .then((ev) => {
        if (ev.data) {
          if (ev.data.state) {
            this.data.media.push(ev.data.url);
            this.updatedData.avatar = ev.data.url;
          }
        }
      });
    modal.present().then(() => this.loader.showLoader(false));
  }
}
