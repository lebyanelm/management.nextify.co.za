// tslint:disable: max-line-length
import { ModalController } from '@ionic/angular';
import { ToastService } from './../../services/toast.service';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-avatar-upload',
  templateUrl: './avatar-upload.component.html',
  styleUrls: ['./avatar-upload.component.scss'],
})
export class AvatarUploadComponent implements AfterViewInit {
  @ViewChild('FileInput', {static: false}) fileInput: ElementRef<HTMLInputElement>;

  @Input() token: string;
  upload;
  isUploading = false;
  constructor(
    private toast: ToastService,
    private modalCtrl: ModalController
  ) { }

  ngAfterViewInit() {
    this.fileInput.nativeElement.onchange = (e) => {
      const file = this.fileInput.nativeElement.files[0],
        filesize = this.getFileSize(file.size),
        extname = '.' + file.type.split('/').pop();
      if (filesize.size > 2 && filesize.isMbUnit) {
        this.toast.show('Can\'t upload images larger than 2MB');
      } else {
        this.isUploading = true;
        this.upload = {
          name: this.generateRandomName() + extname,
          uploading: true,
          progress: 0,
          url: '/assets/images/loader.gif'
        };

        superagent
          .post(environment.backendServer + '/assets/upload?token=' + this.token + '&name=' + this.upload.name + '&isAvatar=true&isPartner=true')
          .on('progress', (e) => this.upload.progress = e.percent)
          .attach('file', file)
          .end((error, response) => {
            this.isUploading = false;
            if (response) {
              if (response.status === 200) {
                this.upload.url = response.body.url;
                this.modalCtrl.dismiss({state: true, url: this.upload.url});
              }
            }
          });
      }
    };
  }

  browseFiles() {
    this.fileInput.nativeElement.click();
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
