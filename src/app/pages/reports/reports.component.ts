import { LoaderService } from "./../../services/loader.service";
import { GetStatementComponent } from "./../../components/get-statement/get-statement.component";
import { GraphValuesCalculatorService } from "./../../services/graph-values-calculator.service";
import { SocketsService } from "src/app/services/sockets.service";
import { Component, AfterViewInit, ViewEncapsulation } from "@angular/core";
import { ChartColor, ChartOptions } from "chart.js";
import { WithdrawModalComponent } from "src/app/components/withdraw-modal/withdraw-modal.component";
import { ModalController } from "@ionic/angular";
import * as d3 from "d3";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ReportsComponent implements AfterViewInit {
  graphCalculations = this.graphDataService.data;
  ordersCount = 0;
  d3 = d3;
  lineChartOptions: ChartOptions = {
    cutoutPercentage: 20,
  };
  colorScheme = {
    domain: ["#FFFFFF"],
  };

  constructor(
    public sockets: SocketsService,
    private graphDataService: GraphValuesCalculatorService,
    private modalCtrl: ModalController,
    private loader: LoaderService
  ) {
    this.graphDataService.onSet.subscribe((data) => {
      this.graphCalculations = data;
    });

    const awaiter = setInterval(() => {
      if (this.sockets.data) {
        for (let property in this.sockets.data.orders) {
          this.ordersCount += this.sockets.data.orders[property].length;
        }
        clearInterval(awaiter);
      }
    }, 100);
  }

  ngAfterViewInit() {
    // For data focusing, so the partner can focus on one dataset bluring the rest
    const headTableCells = document.querySelectorAll(".table thead td"),
      bodyTableCells: any = document.querySelectorAll(".table tbody td");

    headTableCells.forEach((hc: HTMLTableCellElement) => {
      hc.onmouseenter = () => {
        bodyTableCells.forEach((bc: HTMLTableCellElement) => {
          bc.setAttribute("data-isActive", "true");
          if (bc.dataset.index === hc.dataset.index) {
            bc.setAttribute("data-isActive", "true");
          } else {
            bc.setAttribute("data-isActive", "false");
          }
        });
      };

      hc.onmouseleave = () => {
        bodyTableCells.forEach((bc: HTMLTableCellElement) => {
          bc.removeAttribute("data-isActive");
          hc.removeAttribute("data-isActive");
        });
      };
    });
  }

  getMonth() {
    return new Date()
      .toLocaleString("default", { month: "long" })
      .toUpperCase();
  }

  async openWithdrawalModal() {
    this.loader.showLoader(true);
    const withdrawalModal = await this.modalCtrl.create({
      component: WithdrawModalComponent,
      cssClass: ["modal", "withdrawal-modal"],
    });

    withdrawalModal.present().then(() => this.loader.showLoader(false));
  }

  async openDateStatementSelection() {
    this.loader.showLoader(true);
    const statementDateSelection = await this.modalCtrl.create({
      component: GetStatementComponent,
      cssClass: ["modal", "promocode-modal"],
    });
    statementDateSelection.present().then(() => this.loader.showLoader(false));
  }
}
