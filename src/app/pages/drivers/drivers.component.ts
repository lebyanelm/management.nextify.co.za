import { LoaderService } from './../../services/loader.service';
import { ToastService } from './../../services/toast.service';
import { environment } from 'src/environments/environment';
import { AddDriverModalComponent } from './../../components/add-driver-modal/add-driver-modal.component';
import { ModalController } from '@ionic/angular';
import { Driver } from './../../interfaces/Driver';
import { SocketsService } from './../../services/sockets.service';
import { Component, OnInit } from '@angular/core';
import * as superagent from 'superagent';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss'],
})
export class DriversComponent implements OnInit {
  searchResults: Driver[] = [];
  selectedDrivers: string[] = [];
  isSelectionMode = false;
  constructor(
    public sockets: SocketsService,
    private modalCtrl: ModalController,
    private toast: ToastService,
    private loader: LoaderService
  ) { }

  ngOnInit() {}
  async openAddDriverModal(data?: Driver) {
    this.loader.showLoader(true);
    const driverAddModal = await this.modalCtrl.create({
      component: AddDriverModalComponent,
      cssClass: ['modal', 'drivers-modal'],
      componentProps: { data }
    });

    driverAddModal.present().then(() => this.loader.showLoader(false));
  }

  confirmDriverDelete(data) {
    this.loader.showLoader(true);
    this.toast.showAlert({
      header: 'Confirm',
      message: ['Are you sure you want to delete driver "', data.name, '" permenantly?'].join(''),
      buttons: [
        { text: 'Yes, I\'m certain', handler: () => this.deleteDriver([data.id]), role: 'danger' },
        { text: 'No, Cancel' }
      ]
    }).then(() => this.loader.showLoader(false));
  }

  confirmDeleteSelected() {
    this.loader.showLoader(true);
    const names = [];
    this.selectedDrivers.forEach((driverId) => {
      const driver = this.sockets.data.drivers.find((d) => d.id === driverId);
      names.push(driver.name);
    });

    this.toast.showAlert({
      header: 'Confirm',
      message: ['Are you sure you want to delete driver "', names.join(', '), '" permenantly?'].join(''),
      buttons: [
        { text: 'Yes, I\'m certain', handler: () => this.deleteDriver(this.selectedDrivers), role: 'danger' },
        { text: 'No, Cancel' }
      ]
    }).then(() => this.loader.showLoader(false));
  }

  deleteDriver(driverIds: string[]): void {
    this.selectedDrivers = [];
    this.isSelectionMode = false;
    this.loader.showLoader(true);
    superagent
      .delete([environment.backendServer, 'driver'].join('/'))
      .set('Authorization', this.sockets.data.token)
      .send({ driverIds })
      .on('progress', (e) => this.loader.pipe(e.percent))
      .end((_, response) => {
        this.loader.showLoader(false);
        if (response) {
          if (response.status === 200) {
            driverIds.forEach((driverId) => {
              const driverIndex = this.sockets.data.drivers.findIndex((driver) => driver.id === driverId);
              if (driverIndex !== -1) {
                this.sockets.data.drivers.splice(driverIndex, 1);
              }
            });
          } else {
            this.toast.show(response.body.reason || 'ERROR: SOMETHING WENT WRONG.');
          }
        } else {
          this.toast.show('ERROR: NO INTERNET CONNECTION.');
        }
      });
  }

  search(keyword: string): void {
    this.searchResults = [];
    keyword = keyword.toLowerCase();
    if (keyword.length) {
      this.sockets.data.drivers.forEach((driver) => {
        for (let property in driver) {
          const driverKeyword = driver[property].toString().toLowerCase(),
                indexInResults = this.searchResults.findIndex((result) => result[property] === driver[property]);
          if (driverKeyword.includes(keyword) && indexInResults === -1) {
            this.searchResults.push(driver);
          }
        }
      });
    }
  }

  selectDriver(id: string) {
    if (this.selectedDrivers.indexOf(id) === -1) {
      this.selectedDrivers.push(id);
    } else {
      this.selectedDrivers.splice(this.selectedDrivers.indexOf(id), 1);
    }

    if (this.selectedDrivers.length) {
      this.isSelectionMode = true;
    } else {
      this.isSelectionMode = false;
    }
  }
}
