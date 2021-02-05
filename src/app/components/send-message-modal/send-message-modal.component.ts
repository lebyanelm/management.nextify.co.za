import { CustomersService } from './../../services/customers.service';
import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import * as superagent from 'superagent';
import { ToastService } from 'src/app/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-send-message-modal',
  templateUrl: './send-message-modal.component.html',
  styleUrls: ['./send-message-modal.component.scss'],
})
export class SendMessageModalComponent implements OnInit {
  @Input() id: string;
  @Input() token: string;

  isLoading = false;
  isLoadingComplete = false;
  isError = false;

  message: any = { text: '', recipients: '' };

  constructor(
    private toast: ToastService,
    private modalCtrl: ModalController,
    private customers: CustomersService
  ) { }

  ngOnInit() {}

  async sendMessage() {
    // Format the recipeints in a format accepted by ther serve
    let recipients = [];
    if (this.message.recipients) {
      if (this.message.recipients.includes(', ')) {
        recipients = this.message.recipients.split(', ');
      } else if (this.message.recipients.includes(',')) {
        recipients = this.message.recipients.split(',');
      } else {
        recipients = [ this.message.recipients ];
      }
    } else {
      await this.customers.getCustomerData()
        .then((customers) => {
          customers.forEach((customer) => recipients.push(customer.id));
        });
    }
    
    if (this.message.text) {
      superagent
        .post(environment.backendServer + '/message')
        .send({message: this.message.text, recipients})
        .set('Authorization', this.token)
        .end((error, response) => {
          if (response) {
            if (response.status === 200) {
              this.modalCtrl.dismiss();
              if (!response.body.reason) {
                this.toast.show(this.message.recipients.includes(',') ? 'Messages sent!' : 'Message sent!');
              } else {
                this.toast.show(response.body.reason);
              }
            } else {
              this.toast.show(response.body.reason);
            }
          }
        });
    } else {
      this.toast.show('Message requires text to be sent.');
    }
  }

}
