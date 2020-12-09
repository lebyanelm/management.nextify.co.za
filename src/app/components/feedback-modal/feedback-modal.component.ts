import { ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';
import { Component, OnInit } from '@angular/core';
import { SocketsService } from 'src/app/services/sockets.service';
import { environment } from 'src/environments/environment';
import * as superagent from 'superagent';
import { create } from 'domain';

@Component({
  selector: 'app-feedback-modal',
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.scss'],
})
export class FeedbackModalComponent implements OnInit {
  ratings: number[] = [1, 2, 3, 4, 5];
  selectedRating: number;
  selectedFeedbackType: number;
  description = '';
  constructor(
    private socketsService: SocketsService,
    private toastService: ToastService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  sendFeedback() {
    const feedbackData: any = {
      rating: this.selectedRating,
      feedbackType: this.selectedFeedbackType,
      description: this.description };
    
    if (feedbackData.feedbackType === 1) {
      feedbackData.feedbackType = 'Bug Report';
    } else if (feedbackData.feedbackType === 2) {
      feedbackData.feedbackType = 'Suggestion';
    } else {
      feedbackData.feedbackType = 'Other';
    }
    
    superagent.
      post([environment.backendServer, 'feedback'].join('/'))
      .set('Authorization', this.socketsService.data.token)
      .send(feedbackData)
      .end((_, response) => {
        if (response) {
          if (response.status === 200) {
            this.toastService.show('Thank you for your suggesstion!');
            this.modalCtrl.dismiss();
          } else {
            this.toastService.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
          }
        } else {
          this.toastService.show('You\'re not connected to the internet. Please check your connection and try again.');
        }
      });
  }
}
