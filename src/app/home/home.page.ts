import { BranchService } from './../services/branch.service';
import { timer } from 'rxjs';
import { SocketsService } from 'src/app/services/sockets.service';
import { BranchCreatorComponent } from './../components/branch-creator/branch-creator.component';
import { RouterService } from './../services/router.service';
import { Component, ViewChild, AfterViewInit, HostBinding } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { environment } from 'src/environments/environment';
import { LoaderService } from '../services/loader.service';

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
    private activatedRoute: ActivatedRoute,
    private loader: LoaderService,
    private storage: StorageService,
    private router: Router ) {}

  ngAfterViewInit() {
    this.ionSlider.lockSwipes(true);
    this.routerService.state.subscribe((s) => {
      this.ionSlider.lockSwipes(false);
      this.ionSlider.slideTo(s);
      this.ionSlider.lockSwipes(true);
    });

    this.activatedRoute.params.subscribe((params) => {
      if (params.page) {
        let pageName = params.page.toLowerCase(),
            page = 0;
        if (pageName === 'products') {
          page = 1;
        } else if (pageName === 'extras') {
          page = 2;
        } else if (pageName === 'banners') {
          page = 3;
        } else if (pageName === 'promocodes') {
          page = 4;
        } else if (pageName === 'customers') {
          page = 5;
        } else if (pageName === 'drivers') {
          page = 6;
        } else if (pageName === 'reports') {
          page = 7;
        } else if (pageName === 'profile')  {
          page = 8;
        }
        this.routerService.routeToSlide(page);
      }
    });

    this.storage.getItem(environment.PARTNER_DATA_REF, false)
      .then((token) => {
        if (token) {
          this.sockets.createConnection()
            .then(() => {
              this.activatedRoute.queryParamMap.subscribe((query) => {
                console.log(query)
              });
            }).catch(() => { this.router.navigateByUrl('/signin'); console.log('error')});
        } else {
          this.router.navigateByUrl('/signin');
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
