import { ToastService } from './../../services/toast.service';
import { SocketsService } from './../../services/sockets.service';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthorizationComponent } from '../authorization/authorization.component';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-withdraw-modal',
  templateUrl: './withdraw-modal.component.html',
  styleUrls: ['./withdraw-modal.component.scss'],
})
export class WithdrawModalComponent implements OnInit, AfterViewInit {
  @ViewChild('WithdrawalAmountInput', { static: false }) withdrawalAmount: ElementRef<HTMLInputElement>;
  
  isAllowed = false;
  isAmountError = true;
  amount = 0;
  isLoading = false;
  constructor(
    public sockets: SocketsService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private toast: ToastService
  ) { }

  ngOnInit() {}
  ngAfterViewInit() {
    this.withdrawalAmount.nativeElement.onkeyup = () => {
      this.withdrawalAmount.nativeElement.value = this.withdrawalAmount.nativeElement.value.indexOf(',') !== -1 ? this.withdrawalAmount.nativeElement.value.replace(',', '.') : this.withdrawalAmount.nativeElement.value;
      this.amount = parseFloat(this.withdrawalAmount.nativeElement.value);
      if (this.amount !== NaN && this.amount <= this.sockets.data.snapshots.totalEarnings) {
        this.isAllowed = true;
        this.isAmountError = false;
      } else {
        this.isAllowed = false;
        this.isAmountError = true;
      }

      this.cdr.detectChanges();
    }
  }

  async requestWithdrawal() {
    const authModal = await this.modalCtrl.create({
      component: AuthorizationComponent,
      cssClass: 'modal authorization-modal',
      componentProps: {
        data: {
          id: this.sockets.data.id,
          avatar: this.sockets.data.media[this.sockets.data.media.length - 1] || this.sockets.data.media[0],
          emailAddress: this.sockets.data.emailAddress }
      }
    });

    authModal.present();

    authModal.onDidDismiss()
      .then((auth) => {
        if (auth.data === true) {
          // Send request
          superagent
            .post(environment.backendServer + '/balance/withdraw')
            .set('Authorization', this.sockets.data.token)
            .send({ amount: this.amount, available: this.sockets.data.snapshots.totalEarnings })
            .end((error, response) => {
              if (response) {
                if (response.status === 200) {
                  this.sockets.data.snapshots.totalEarnings -= this.amount;
                  this.modalCtrl.dismiss();
                  this.toast.show('SUCCESS: WITHDRAWAL REQUEST SENT.');
                } else {
                  this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
                }
              }
            })
        } else {
          this.toast.show('ERROR: VERIFICATION FAILED!', {translucent: true, cssClass: 'danger', duration: 20000});
        }
      }).catch(error => {
        console.log(error);
        this.toast.show('ERROR: SOMETHING WENT WRONG.');
      });
  }
}
