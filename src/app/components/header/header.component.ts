import { StatusService } from './../../services/status.service';
import { BranchService } from './../../services/branch.service';
import { BranchCreatorComponent } from './../branch-creator/branch-creator.component';
import { SendMessageModalComponent } from './../send-message-modal/send-message-modal.component';
import { NotificationService } from './../../services/notification.service';
import { RouterService } from './../../services/router.service';
import { LoaderService } from './../../services/loader.service';
import { Sales } from './../../interfaces/Sales';
import { Partner } from '../../interfaces/Partner';
import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { SocketsService } from 'src/app/services/sockets.service';
import { interval } from 'rxjs';
import * as superagent from 'superagent';
import { IonToggle, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @ViewChild('BranchStatusToggle', {static: false}) branchStatusToggle: IonToggle;

  sales: Sales;
  isOnline: boolean;
  token: string;
  id: string;
  isBranchStatusChangedBefore = false;
  driverConnections = 0;

  constructor(
    public sockets: SocketsService,
    public loader: LoaderService,
    public routerService: RouterService,
    private notifications: NotificationService,
    private modalCtrl: ModalController,
    public branch: BranchService,
    private toast: ToastService,
    private status: StatusService
  ) {
    this.loader.showLoader(true);
    this.status.stateChange.subscribe((s) => {
      this.isOnline = s;
    });
  }

  ngOnInit() {
    const awaiter = interval(500)
      .subscribe(() => {
        if (this.sockets.data) {
          this.sales = this.sockets.data.sales;
          this.token = this.sockets.data.token;
          this.id = this.sockets.data.id;
          this.loader.showLoader(false);
          awaiter.unsubscribe();
        }
      });

    // Register a listener to count how many drivers are connected
    this.notifications.driver_connected.subscribe((count) => {
      this.driverConnections = count;
    });
  }

  changeBranchStatus(requestedState) {
    superagent
      .post(environment.backendServer + '/status/')
      .send({ state: requestedState,
          token: this.sockets.data.token,
          branchId: this.sockets.data.branches[this.branch.index].id,
          socketId: this.sockets.connection.id })
      .on('progress', (e) => this.loader.pipe(e.percent))
      .end((error, response) => {
          if (response) {
            if (response.status === 200) {
              this.isOnline = requestedState;
              this.status.status = this.isOnline;
              this.isBranchStatusChangedBefore = true;
            } else {
              this.toast.show(response.body.reason || 'ERROR: SOMETHING WRONG HAPPENED.');
            }
          } else {
            this.toast.show('ERROR: NO INTERNET CONNECTION.');
          }
      });
  }

  async openBranchCreatorModal() {
    this.loader.showLoader(true);
    const branchCreatorModal = await this.modalCtrl.create({
      component: BranchCreatorComponent,
      cssClass: 'modal branch-creator',
      componentProps: {
        id: this.id,
        token: this.token
      }
    });
    branchCreatorModal.present().then(() => this.loader.showLoader(false));
  }

  async openMessageModal() {
    this.loader.showLoader(true);
    const messageModal = await this.modalCtrl.create({
      component: SendMessageModalComponent,
      componentProps: { token: this.token, id: this.id },
      cssClass: 'modal message-modal'
    });
    messageModal.present().then(() => this.loader.showLoader(false));
  }
}
