import { ToastService } from 'src/app/services/toast.service';
import { BannerModalComponent } from './../../components/banner-modal/banner-modal.component';
import { SocketsService } from 'src/app/services/sockets.service';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as superagent from 'superagent';
import { LoaderService } from 'src/app/services/loader.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss'],
})
export class BannersComponent implements OnInit {
  constructor(
    private modalCtrl: ModalController,
    public sockets: SocketsService,
    private toast: ToastService,
    private loader: LoaderService
  ) { }

  ngOnInit() {}

  async openBannerModal() {
    this.loader.showLoader(true);
    const bannerModal = await this.modalCtrl.create({
      component: BannerModalComponent,
      cssClass: 'modal banner-modal',
      componentProps: {
        token: this.sockets.data.token
      }
    });

    bannerModal.present().then(() => this.loader.showLoader(false));
  }

  async confirmDeleteBanner(id: string) {
    this.loader.showLoader(true);
    const banner = this.sockets.data.banners.find((b) => b.id === id);
    this.toast.showAlert({
      header: 'Confirm',
      // tslint:disable-next-line: max-line-length
      message: 'Are you sure you want to delete the banner permanently?',
      buttons: [
        { text: 'Yes, I\'m cetain', handler: () => this.deleteBanner(id), role: 'danger'  },
        { text: 'No, Cancel' }
      ]
    }).then(() => this.loader.showLoader(false));
  }

  deleteBanner(bannerId: string) {
    this.loader.showLoader(true);
    superagent
      .delete(environment.backendServer + '/banner')
      .set('Authorization', this.sockets.data.token)
      .send({ bannerId })
      .end((error, response) => {
        this.loader.showLoader(false);
        if (response) {
          if (response.status === 200 || (response.status === 404 && response.body.reason === 'ERROR: BANNER NOT FOUND')) {
            if (response.body.reason === 'ERROR: BANNER NOT FOUND') {
              this.toast.show('ERROR: BANNER NO LONGER EXISTS, REMOVING...');
            }

            const bannerIndex = this.sockets.data.banners.findIndex(banner => banner.id === bannerId);
            this.sockets.data.banners.splice(bannerIndex, 1);
          } else {
            this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
          }
        } else {
          this.toast.show('ERROR: NO INTERNET CONNECTION.');
        }
      });
  }
}
