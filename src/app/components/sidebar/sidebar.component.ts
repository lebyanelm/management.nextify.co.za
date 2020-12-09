import { FeedbackModalComponent } from './../feedback-modal/feedback-modal.component';
import { ModalController } from '@ionic/angular';
import { RouterService } from './../../services/router.service';
import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  constructor(
    public routerService: RouterService,
    private modalCtrl: ModalController,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.routerService.state.subscribe((s) => {
      const sidebarActiveLink = document.querySelector('.sidebar-link.active'),
        sidebarRoutedLink = document.querySelector(`.sidebar-link-${s}`);
      sidebarActiveLink.classList.remove('active');
      sidebarRoutedLink.classList.add('active');
    });
  }

  async openSendFeedbackModal() {
    this.loaderService.showLoader(true);
    const sendFeedbackModal = await this.modalCtrl.create({
      component: FeedbackModalComponent,
      cssClass: ['modal', 'feedback-modal']
    });

    sendFeedbackModal.present()
      .then(() => this.loaderService.showLoader(false));
  }
}
