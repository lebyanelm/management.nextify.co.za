import { SocketsService } from './../../services/sockets.service';
import { environment } from './../../../environments/environment';
import { ToastService } from './../../services/toast.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import * as superagent from 'superagent';

@Component({
  selector: 'app-get-statement',
  templateUrl: './get-statement.component.html',
  styleUrls: ['./get-statement.component.scss'],
})
export class GetStatementComponent implements OnInit, AfterViewInit {
  @ViewChild('IonStartDateInput', { static: false }) ionStartDateInput: IonDatetime;
  @ViewChild('IonEndDateInput', { static: false }) ionEndDateInput: IonDatetime;
  
  isAllowed = true;
  isLoading = false;
  constructor(
    private toast: ToastService,
    private sockets: SocketsService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}
  ngAfterViewInit() {
    this.ionStartDateInput.ionChange
      .subscribe(() => {
        if (this.ionEndDateInput.value) {
          this.verifyDateInputValues();
        }
      });

    this.ionEndDateInput.ionChange
      .subscribe(() => {
        if (this.ionStartDateInput) {
          this.verifyDateInputValues();
        }
      })
  }

  public generateStatement(): void {
    superagent
      .get([environment.backendServer, 'statement?token=' + this.sockets.data.token + '&start=' + this.ionStartDateInput.value + '&end=' + this.ionEndDateInput.value].join('/'))
      .end((_, response) => {
        if (response) {
          if (response.status === 200) {
            window.open(response.body.statementUrl, '_blank');
            this.modalCtrl.dismiss();
          } else {
            this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
          }
        } else {
          this.toast.show('ERROR: NO INTERNET CONNECTION.');
        }
      });
  }

  private verifyDateInputValues(): void {
    const startDate = new Date(this.ionStartDateInput.value),
          endDate = new Date(this.ionEndDateInput.value);
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      if (startDate.getDay() < endDate.getDay()) {
        this.isAllowed = true;
      } else {
        this.isAllowed = false;
      }
    } else {
      if (startDate.getFullYear() === endDate.getFullYear()) {
        if (startDate.getMonth() < endDate.getMonth()) {
          this.isAllowed = true;
        } else {
          this.isAllowed = false;
        }
      } else {
        if (startDate.getFullYear() < endDate.getFullYear() && startDate.getMonth() < endDate.getMonth()) {
          this.isAllowed = true;
        } else {
          this.isAllowed = false;
        }
      }
    }

    if (!this.isAllowed) {
      this.toast.show('Invalid date range selected!');
    }
  }
}
