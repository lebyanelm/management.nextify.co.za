import { FeedbackModalComponent } from './../feedback-modal/feedback-modal.component';
import { ModalController } from '@ionic/angular';
import { RouterService } from './../../services/router.service';
import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { StorageService } from 'src/app/services/storage.service';
import { SocketsService } from 'src/app/services/sockets.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  constructor(
    public routerService: RouterService,
    private modalCtrl: ModalController,
    private loaderService: LoaderService,
    private router: Router,
    private storage: StorageService,
    private sockets: SocketsService
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

  signOut() {
    // Permenantly remove the reference of the token
    this.storage.remove(environment.PARTNER_DATA_REF);

    // Disconnect the socket connection
    this.sockets.disconnect();

    // Route away from the dashboard page, and clear back routes
    this.router.navigate(['/signin']);
  }
}
