import { BranchService } from './../services/branch.service';
import { timer } from 'rxjs';
import { SocketsService } from 'src/app/services/sockets.service';
import { BranchCreatorComponent } from './../components/branch-creator/branch-creator.component';
import { RouterService } from './../services/router.service';
import { Component, ViewChild, AfterViewInit, HostBinding } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  @ViewChild('IonSlider', {static: false}) ionSlider: IonSlides;

  constructor(
    private routerService: RouterService,
    private sockets: SocketsService,
    private modalCtrl: ModalController,
    private branch: BranchService,
    private activatedRoute: ActivatedRoute ) {}

  ngAfterViewInit() {
    this.ionSlider.lockSwipes(true);
    this.routerService.state.subscribe((s) => {
      this.ionSlider.lockSwipes(false);
      this.ionSlider.slideTo(s);
      this.ionSlider.lockSwipes(true);
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.page) {
        let page = 0;
        if (params.page === 'products') {
          page = 1;
        } else if (params.page === 'extras') {
          page = 2;
        } else if (params.page === 'promocodes') {
          page = 3;
        } else if (params.page === 'customers') {
          page = 4;
        } else if (params.page === 'snapshots') {
          page = 5;
        } else if (params.page === 'account') {
          page = 6;
        }

        this.routerService.routeToSlide(page);
      }
    });


    const watchId = timer(100, 500)
      .subscribe((s) => {
        if (this.sockets.data) {
          watchId.unsubscribe();
          if (this.sockets.data.branches.length > 1) {
            let branchRememberData: any = localStorage.getItem('branch');
            if (branchRememberData) {
              branchRememberData = JSON.parse(branchRememberData);
              if (this.sockets.data.branches[branchRememberData.index]) {
                this.branch.index = branchRememberData.index;
              } else {
                this.openBranchSelector();
              }
            } else {
              this.openBranchSelector();
            }
          } else {
            this.branch.index = 0;
          }
        }
      });
  }

  async openBranchSelector() {
    const branchSelector = await this.modalCtrl.create({
      component: BranchCreatorComponent,
      cssClass: 'modal branch-creator',
      componentProps: {
        isSelectBranch: true,
        token: this.sockets.data.token
      }
    });

    branchSelector.present();
    branchSelector.backdropDismiss = false;
  }
}
