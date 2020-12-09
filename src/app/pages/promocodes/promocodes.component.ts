import { ToastService } from './../../services/toast.service';
import { LoaderService } from './../../services/loader.service';
import { Promocode } from '../../interfaces/Promocode';
import { PromocodeModalComponent } from './../../components/promocode-modal/promocode-modal.component';
import { ModalController } from '@ionic/angular';
import { SocketsService } from 'src/app/services/sockets.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-promocodes',
  templateUrl: './promocodes.component.html',
  styleUrls: ['./promocodes.component.scss'],
})
export class PromocodesComponent implements OnInit, AfterViewInit {
  @ViewChild('SearchInput', { static: false }) searchInput: ElementRef<HTMLInputElement>;
  isSelectionMode = false;
  selectedItems: string[] = [];
  searchResults: Promocode[] = [];

  constructor(
    public sockets: SocketsService,
    private modalCtrl: ModalController,
    private loader: LoaderService,
    private toast: ToastService
  ) { }

  ngOnInit() {}
  ngAfterViewInit() {
    this.searchInput.nativeElement.onkeyup = () => {
      this.searchResults = [];
      const keyword = this.searchInput.nativeElement.value.toLowerCase();
      if (keyword.length) {
        const scan = (object: any, original: Promocode) => {
          for (let property in object) {
            if (typeof object[property] === 'string' || typeof object[property] === 'number') {
              if (object[property].toString().toLowerCase().includes(keyword)) {
                const found = this.searchResults.find((promocode) => promocode.id === original.id)
                if (!found) {
                  this.searchResults.push(original);
                  break;
                }
              }
            } else if (typeof object[property] === 'object') {
              scan(object[property], original);
            }
          }
        };

        this.sockets.data.promocodes.forEach((promocode) => {
          scan(promocode, promocode);
        });
      }

      console.log(this.searchResults)
    }
  }

  selectPromocode(promocodeId, state) {
    if (!state) {
      this.selectedItems.push(promocodeId);
    } else {
      this.selectedItems.splice(this.selectedItems.indexOf(promocodeId), 1);
    }

    this.isSelectionMode = this.selectedItems.length > 0;
  }

  confirmDeletePromocode(promocode: Promocode): void {
    const alert = this.toast.showAlert({
      header: 'Confirm',
      message: ['Are you sure you want to delete', promocode.code, 'permenantly?'].join(' '),
      buttons: [
        { text: 'Yes, I\'m certain', handler: () => { this.deletePromocodes(promocode); } },
        { text: 'No, cancel' }]
    });
  }

  deletePromocodes(promocodes: any) {
    console.log(promocodes)
    this.loader.showLoader(true);

    console.log(promocodes)
    if (promocodes && promocodes.constructor !== Array) {
      promocodes = [promocodes];
    }

    superagent
      .delete(environment.backendServer + '/promocode?partnerId=' + this.sockets.data.id)
      .send({promocodeIds: promocodes, token: this.sockets.data.token})
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        if (response) {
          this.loader.showLoader(false);
          if (response.status === 301) {
            promocodes.forEach((promocodeId, idIndex) => {
              this.sockets.data.promocodes.forEach((_p, promocodeIndex) => {
                if (_p.id === promocodeId) {
                  this.sockets.data.promocodes.splice(promocodeIndex, 1);
                }
              });
            });

            this.selectedItems = [];
            this.isSelectionMode = false;
          } else {
            this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
          }
        }
      });
  }

  confirmDeleteSelectedPromocodes(promocodes: string[]): void {
    console.log(promocodes)
    const promocodesNames = [];
    promocodes.forEach((promocodeId: string) => {
      promocodesNames.push(this.sockets.data.promocodes.find((p) => p.id === promocodeId).code);
    });

    this.toast.showAlert({
      header: 'Confirm',
      message: ['Are you sure you want to delete', promocodesNames.join(', '), 'permenantly?'].join(' '),
      buttons: [
        { text: 'Yes, I\'m certain', handler: () => this.deletePromocodes(promocodes) },
        { text: 'No, cancel' }
      ]
    });
  }

  editPromocode(promocode: Promocode): void {
    this.openPromocodeModal(promocode);
  }

  async openPromocodeModal(promocode: any = {}) {
    const modal = await this.modalCtrl.create({
      component: PromocodeModalComponent,
      componentProps: { data: promocode },
      cssClass: 'modal promocode-modal'
    });
    modal.present();

    // Wait for the data returned back when changes have been saved
    if (promocode.id !== undefined) {
      modal.onDidDismiss()
        .then((data) => {
          console.log(data.data)
          if (data.data) {
            const index = this.sockets.data.promocodes.indexOf(promocode);
            console.log(index)
            if (index !== -1) {
              this.sockets.data.promocodes[index] = data.data;
            }
          }
        });
    }
  }
}
