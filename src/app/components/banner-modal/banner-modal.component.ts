import { SocketsService } from 'src/app/services/sockets.service';
import { LoaderService } from './../../services/loader.service';
import { ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { post } from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-banner-modal',
  templateUrl: './banner-modal.component.html',
  styleUrls: ['./banner-modal.component.scss'],
})
export class BannerModalComponent implements AfterViewInit {
  @Input() token: string;

  @ViewChild('FileSelector', {static: false}) fileSelector: ElementRef<HTMLInputElement>;
  data = {title: '', message: '', image: ''};
  progress: any = {  };
  isUploading = false;

  constructor(
    private toast: ToastService,
    private modalCtrl: ModalController,
    private loader: LoaderService,
    private sockets: SocketsService
  ) { }

  ngAfterViewInit() {
    this.fileSelector.nativeElement.onchange = (e) => {
      const file = this.fileSelector.nativeElement.files[0],
        filesize = this.getFileSize(file.size),
        extname = '.' + file.type.split('/').pop();
      if (filesize.size > 2 && filesize.isMbUnit) {
        this.toast.show('Can\'t upload images larger than 2MB');
      } else {
        this.isUploading = true;
        this.progress = {
          name: this.generateRandomName() + extname,
          percent: 0
        };

        // tslint:disable-next-line: max-line-length
        post(environment.backendServer + '/assets/upload?token=' + this.token + '&name=' + this.progress.name + '&isPartner=true')
        .on('progress', (event) => this.progress.percent = event.percent)
        .attach('file', file)
        .end((error, response) => {
          if (response) {
            if (response.status === 200) {
              console.log(response)
              this.data.image = response.body.url;
            }
          }
        });
      }
    };
  }

  createBanner() {
    this.loader.showLoader(true);
    post(environment.backendServer + '/banner')
    .send({ ...this.data, token: this.token })
    .end((error, response) => {
      this.loader.showLoader(false);
      console.log(response)
      if (!error) {
        if (response.status === 200) {
          console.log(response.body)
          this.sockets.data.banners.push(response.body.banner);
          this.modalCtrl.dismiss();
        } else if (response.status === 500) {
          this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
        }
      } else {
        if (response) {
          this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
        } else {
          this.toast.show('ERROR: YOU ARE NOT CONNECTED TO THE INTERNET.');
        }
      }
    });
  }

  openImageSelector() {
    this.fileSelector.nativeElement.click();
  }

  generateRandomName(nameLength = 5) {
    const numbers = '0123456789';
    let name = '';
    for (let index = 0; index < nameLength; index++) {
      name += numbers.charAt(Math.floor(Math.random() * (numbers.length - 1)));
    }
    return name;
  }

  getFileSize(size: number) {
    size = size / 1024;
    if (size > 1024) {
      return {size: size / 1024, isMbUnit: true};
    } else {
      return {size, isMbUnit: false};
    }
  }
}
