import { Extra } from 'src/app/interfaces/Extra';
import { ToastService } from './../../services/toast.service';
import { LoaderService } from './../../services/loader.service';
import { ExtrasModalComponent } from './../../components/extras-modal/extras-modal.component';
import { ModalController } from '@ionic/angular';
import { SocketsService } from './../../services/sockets.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-extras',
  templateUrl: './extras.component.html',
  styleUrls: ['./extras.component.scss'],
})
export class ExtrasComponent implements OnInit, AfterViewInit {
  @ViewChild('SearchInput', { static: false }) searchInput: ElementRef<HTMLInputElement>;
  isLoading = false;
  searchResults = [];
  selectedExtras : string[] = [];
  isSelectionMode = false;
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
      const keyword = this.searchInput.nativeElement.value.toString().toLowerCase();
      if (keyword) {
        const scan = (object, original: Extra) => {
          for (let property in object) {
            if (typeof object[property] === 'string' || typeof object[property] === 'number') {
              const found = this.searchResults.find((extra) => extra.id === original.id);
              if (!found) {
                if (object[property].toString().toLowerCase().includes(keyword)) {
                  this.searchResults.push(original);
                  break;
                }
              }
            } else if (typeof object[property] === 'object') {
              scan(object[property], original);
            }
          }
        };

        this.sockets.data.extras.forEach(extra => scan(extra, extra));
      }
      console.log(this.searchResults)
    }
  }

  async openExtrasModal() {
    const extrasModal = this.modalCtrl.create({
      component: ExtrasModalComponent,
      cssClass: ['modal', 'extras'],
      componentProps: {
        partnerToken: this.sockets.data.token
      }
    });

    (await extrasModal).present();
  }

  confirmExtraDelete(extraIds: string[]): void {
    const names = [];

    extraIds.forEach(extraId => {
      const extra = this.sockets.data.extras.find((extra) => extra.id === extraId);
      names.push(extra.name);
    });

    this.toast.showAlert({
      header: 'Confirm',
      message: ['Are you sure you want to delete the extras "', names.join(', '), '" permenantly?'].join(''),
      buttons: [
        { text: 'Yes, I\'m certain', handler: () => this.deleteExtras(extraIds) },
        { text: 'No, Cancel' }
      ]
    });
  }

  deleteExtras(extraIds: string[]): void {
    const extrasAlreadyInUse = [];
    extraIds.forEach((extraId) => {
      this.sockets.data.extras.forEach((extra) => {
        if (extra.id === extraId) {
          this.sockets.data.products.forEach((product) => {
            if (product.extras.includes(extra.id)) {
              if (!extrasAlreadyInUse.includes(extra.name)) {
                extrasAlreadyInUse.push(extra.name);
              }
            }
          })
        }
      });
    });

    const finalizeDelete = () => {
      this.loader.showLoader(true);
      this.isLoading = false;
      superagent
        .delete(environment.backendServer + '/extra')
        .set('Authorization', this.sockets.data.token)
        .send({ extraIds })
        .end((_, response) => {
          this.loader.showLoader(false);
          this.isSelectionMode = false;
          if (response) {
            if (response.status === 200) {
              extraIds.forEach((extraId) => {
                this.sockets.data.extras.forEach((extra, index) => {
                  if (extra.id === extraId) {
                    this.sockets.data.extras.splice(index, 1);
                  }
                });
              });
            } else {
              this.loader.showLoader(false, true);
              this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
            }
          } else {
            this.toast.show('You\'re not connected to the internet.');
          }
      });
    }
    
    if (extrasAlreadyInUse.length) {
      this.toast.showAlert({
        header: 'Deleting affecting products',
        message: ['Some of the selected extras to be deleted "', extrasAlreadyInUse.join(', '), '" are being used in a product, deleting these extras will remove it from the product also.', ].join(''),
        buttons: [
          { text: 'Yes, I\'m aware', handler: finalizeDelete },
          { text: 'No, Cancel' }
        ]
      });
    } else {
      finalizeDelete();
    }
    
    
  }

  async editExtra(extra: Extra) {
    const extraModal = await this.modalCtrl.create({
      component: ExtrasModalComponent,
      componentProps: { data: extra },
      cssClass: ['modal', 'extras']
    });

    extraModal.present();
  }

  selectExtra(id: string) : void {
    if (this.selectedExtras.indexOf(id) === -1) {
      this.selectedExtras.push(id);
    } else {
      this.selectedExtras.splice(this.selectedExtras.indexOf(id), 1);
    }

    if (this.selectedExtras.length) {
      this.isSelectionMode = true;
    } else {
      this.isSelectionMode = false;
    }
  }
}
