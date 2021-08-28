import { LoaderService } from "./../../services/loader.service";
import { ToastService } from "./../../services/toast.service";
import { environment } from "src/environments/environment";
import { AddDriverModalComponent } from "./../../components/add-driver-modal/add-driver-modal.component";
import { ModalController } from "@ionic/angular";
import { Driver } from "./../../interfaces/Driver";
import { SocketsService } from "./../../services/sockets.service";
import { Component, OnInit } from "@angular/core";
import * as superagent from "superagent";

@Component({
  selector: "app-drivers",
  templateUrl: "./drivers.component.html",
  styleUrls: ["./drivers.component.scss"],
})
export class DriversComponent implements OnInit {
  drivers: Driver[] = [];
  searchResults: Driver[] = [];
  selectedDrivers: string[] = [];
  isSelectionMode = false;
  constructor(
    public sockets: SocketsService,
    private modalCtrl: ModalController,
    private toast: ToastService,
    private loader: LoaderService
  ) {}

  ngOnInit() {
    const awaiter = setInterval(() => {
      if (this.sockets.data) {
        clearInterval(awaiter);
        console.log("Getting drivers...");
        superagent
          .get([environment.backendServer, "/drivers"].join(""))
          .set("Authorization", this.sockets.data.token)
          .end((_, response) => {
            if (response) {
              if (response.status === 200) {
                this.drivers = response.body.drivers;
              } else {
                this.toast.show(
                  response.body.reason ||
                    "ERROR: SOMETHING WENT WRONG WHILE RETRIEVING DRIVERS."
                );
              }
            } else {
              this.toast.show(
                "ERROR: SOMETHING WENT WRONG WHILE RETRIEVING DRIVERS."
              );
            }
          });
      }
    }, 500);
  }
  async openAddDriverModal(data?: Driver) {
    this.loader.showLoader(true);
    const driverAddModal = await this.modalCtrl.create({
      component: AddDriverModalComponent,
      cssClass: ["modal", "drivers-modal"],
      componentProps: { data, drivers: this.drivers },
    });

    driverAddModal.present().then(() => this.loader.showLoader(false));
    driverAddModal
      .onDidDismiss()
      .then((data: { role: string; data: Driver[] }) => {
        if (data.data) {
          this.drivers = data.data;
        }
      });
  }

  confirmDriverDelete(data) {
    this.loader.showLoader(true);
    this.toast
      .showAlert({
        header: "Confirm",
        message: [
          'Are you sure you want to delete driver "',
          data.name,
          '" permenantly?',
        ].join(""),
        buttons: [
          {
            text: "Yes, I'm certain",
            handler: () => this.deleteDriver([data.username]),
            role: "danger",
          },
          { text: "No, Cancel" },
        ],
      })
      .then(() => this.loader.showLoader(false));
  }

  confirmDeleteSelected() {
    this.loader.showLoader(true);
    const names = [];
    this.selectedDrivers.forEach((username) => {
      const driver = this.sockets.data.drivers.find(
        (d) => d.username === username
      );
      names.push(driver.name);
    });

    this.toast
      .showAlert({
        header: "Confirm",
        message: [
          'Are you sure you want to delete driver "',
          names.join(", "),
          '" permenantly?',
        ].join(""),
        buttons: [
          {
            text: "Yes, I'm certain",
            handler: () => this.deleteDriver(this.selectedDrivers),
            role: "danger",
          },
          { text: "No, Cancel" },
        ],
      })
      .then(() => this.loader.showLoader(false));
  }

  deleteDriver(usernames: string[]): void {
    this.selectedDrivers = [];
    this.isSelectionMode = false;
    this.loader.showLoader(true);
    superagent
      .delete([environment.backendServer, "driver"].join("/"))
      .set("Authorization", this.sockets.data.token)
      .send({ usernames })
      .on("progress", (e) => this.loader.pipe(e.percent))
      .end((_, response) => {
        this.loader.showLoader(false);
        if (response) {
          if (response.status === 200) {
            usernames.forEach((username) => {
              const driverIndex = this.drivers.findIndex(
                (driver) => driver.username === username
              );
              if (driverIndex !== -1) {
                this.drivers.splice(driverIndex, 1);
              }
            });
          } else {
            this.toast.show(
              response.body.reason || "ERROR: SOMETHING WENT WRONG."
            );
          }
        } else {
          this.toast.show("ERROR: NO INTERNET CONNECTION.");
        }
      });
  }

  search(keyword: string): void {
    this.searchResults = [];
    keyword = keyword.toLowerCase();
    if (keyword.length) {
      this.drivers.forEach((driver) => {
        for (let property in driver) {
          const excludeKeys = Object.keys(driver);
          const keywordInExcluded = excludeKeys.find((key) => key.includes(keyword))
          if (!keywordInExcluded) {
            const searchableText = JSON.stringify(driver);
            if (searchableText.includes(keyword)) {
              if (this.searchResults.indexOf(driver) === -1) this.searchResults.push(driver)
            }
          }
        }
      });
    }
  }

  selectDriver(username: string) {
    if (this.selectedDrivers.indexOf(username) === -1) {
      this.selectedDrivers.push(username);
    } else {
      this.selectedDrivers.splice(this.selectedDrivers.indexOf(username), 1);
    }

    if (this.selectedDrivers.length) {
      this.isSelectionMode = true;
    } else {
      this.isSelectionMode = false;
    }
  }
}
