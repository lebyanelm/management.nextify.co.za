import { ModalController } from '@ionic/angular';
import { LoaderService } from './../../services/loader.service';
import { Component, OnInit, Input } from '@angular/core';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss'],
})
export class AuthorizationComponent implements OnInit {
  @Input() data: {id: string, avatar: string, emailAddress: string};
  isLoading = false;

  password = '';
  constructor(
    private loader: LoaderService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  approve() {
    this.isLoading = true;
    this.loader.showLoader(this.isLoading);
    superagent
      .get(environment.backendServer + '/auth?id=true')
      .auth(this.data.id, this.password, {type: 'basic'})
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        this.isLoading = false;
        this.loader.showLoader(this.isLoading);
        if (response) {
          if (response.status === 200) {
            this.modalCtrl.dismiss(true);
          } else if (response.status === 403) {
            this.modalCtrl.dismiss(false);
          }
        }
      });
  }
}
