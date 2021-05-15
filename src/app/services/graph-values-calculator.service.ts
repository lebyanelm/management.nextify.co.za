import { Transaction } from './../interfaces/Transaction';
import { BranchService } from './branch.service';
import { SocketsService } from './sockets.service';
import { Injectable } from '@angular/core';
import { format } from 'date-and-time';
import { Subject } from 'rxjs';
import { MultiDataSet } from 'ng2-charts/lib/base-chart.directive';
import { ChartDataSets } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class GraphValuesCalculatorService {
  private _data: any = [];
  public onSet: Subject<any> = new Subject<any>();
  constructor(
    private sockets: SocketsService,
    private branch: BranchService) {
    // Add functionality to the Date class
    const _orders = [],
      currentDate = new Date(),
      noDays = this.getNumberOfDays(currentDate.getFullYear(), currentDate.getMonth());
    
    const awaiter = setInterval(() => {
      if (this.sockets.data && this.branch.id) {
        this.initialise(noDays);
        this.sockets.connection.on('order', () => {
          this.initialise(noDays);
        });
        clearInterval(awaiter);
      }
    }, 100);
  }

  initialise(noDays) {
    const date = new Date();

    const data = {
      name: date.toLocaleString('default', { month: 'long' }),
      series: []
    };
    
    for (let day = 1; day <= noDays; day++) {

      // Setup the values of the days in the current month as per index
      if (data.series[day - 1] === undefined) {
        data.series.push({ name: day.toString(), value: 0 });
      }
      
      if (this.sockets.data.transactions.length) {
        this.sockets.data.transactions.forEach((transaction: Transaction) => {
          if (transaction.type === 'Online' || transaction.type === 'Cash') {
            const transactionDate = new Date(transaction.timeCreated.timestamp);
            if (transactionDate.getFullYear() === date.getFullYear()) {
              if (transactionDate.getMonth() === date.getMonth()) {
                if (day === transactionDate.getDate()) {
                  if (transaction.amountIn) {
                    data.series[day - 1].value += parseFloat(transaction.amountIn);
                  }

                  if (transaction.amountOut) {
                    data.series[day - 1].value -= parseFloat(transaction.amountOut);
                  }
                }
              }
            }
          }
        });
      }
    }
    this._data = [data];
    this.onSet.next(this._data);
  }

  getNumberOfDays(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  
  set data(data) {
    this._data = data;
    this.onSet.next(this.data);
  }

  get data() {
    return this._data;
  }
}
