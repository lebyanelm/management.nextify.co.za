import { LoaderService } from "./../../services/loader.service";
import { ToastService } from "./../../services/toast.service";
import { SocketsService } from "./../../services/sockets.service";
import { Driver } from "./../../interfaces/Driver";
import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import * as superagent from "superagent";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-add-driver-modal",
  templateUrl: "./add-driver-modal.component.html",
  styleUrls: ["./add-driver-modal.component.scss"],
})
export class AddDriverModalComponent implements OnInit {
  isLoading: boolean = false;
  data;
  drivers: Driver[] = [];
  unEdited = {};
  constructor(
    private modalCtrl: ModalController,
    private sockets: SocketsService,
    private toast: ToastService,
    private loader: LoaderService
  ) {}

  ngOnInit() {
    if (!this.data) {
      this.data = {};
    }

    // Disable global
    if (this.data && this.data.username) {
      const copy = {};
      for (let property in this.data) {
        copy[property] = this.data[property];
        this.unEdited[property] = this.data[property];
      }
      this.data = copy;
    }
  }
  createDriver() {
    this.loader.showLoader(true);
    this.isLoading = true;
    superagent
      .post([environment.backendServer, "driver"].join("/"))
      .set("Authorization", this.sockets.data.token)
      .on("progress", (e) => this.loader.pipe(e.percent))
      .send(this.data)
      .end((error, response) => {
        this.loader.showLoader(false);
        if (response) {
          this.isLoading = false;
          console.log(response.body);
          if (response.status === 200) {
            if (!this.sockets.data.drivers) {
              this.sockets.data.drivers = [];
            }
            this.sockets.data.drivers.push(response.body.driver);
            this.modalCtrl.dismiss();
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
  editDriver() {
    this.loader.showLoader(true);
    this.isLoading = true;
    const changes = this.getChanges();
    if (changes.changesFound) {
      superagent
        .patch([environment.backendServer, "driver"].join("/"))
        .set("Authorization", this.sockets.data.token)
        .on("progress", (e) => this.loader.pipe(e.percent))
        .send({ changes: changes.changes, username: this.data.username })
        .end((_, response) => {
          this.loader.showLoader(false);
          this.isLoading = false;
          if (response) {
            if (response.status === 200) {
              const driverIndex = this.drivers.findIndex(
                (_driver) => _driver.username === this.data.username
              );
              if (driverIndex !== -1) {
                for (let change in changes.changes) {
                  this.drivers[driverIndex][change] = changes.changes[change];
                  delete this.drivers[driverIndex].loginPassword;
                }
              }

              this.modalCtrl.dismiss(this.drivers);
            } else {
              this.toast.show(
                response.body.reason || "ERROR: SOMETHING WENT WRONG."
              );
            }
          } else {
            this.toast.show("ERROR: NO INTERNET CONNECTION.");
          }
        });
    } else {
      this.loader.showLoader(false);
      this.isLoading = false;
      this.toast.show("ERROR: NO CHANGES MADE.");
    }
  }

  payout() {
    superagent
      .post([environment.backendServer, "driver/payout"].join("/"))
      .set("Authorization", this.sockets.data.token)
      .send({ driverUsername: this.data.username })
      .end((_, response) => {
        if (response) {
          if (response.status === 200) {
            this.toast.show(
              "DRIVER BALANCE UPDATED. YOU MAY NEED TO RELOAD PAGE FOR CHANGES."
            );
            this.data.balance = 0;
            this.editDriver();
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

  getChanges() {
    const changes = {};
    let changesFound = false;
    for (let property in this.data) {
      if (this.data[property] !== this.unEdited[property]) {
        changes[property] = this.data[property];
        changesFound = true;
      }
    }
    return { changes, changesFound };
  }
}
