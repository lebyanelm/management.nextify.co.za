import { Customer } from './../interfaces/Customer';
import { LoaderService } from './loader.service';
import { SocketsService } from './sockets.service';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import * as superagent from 'superagent';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private customers = [];
  constructor(
    private sockets: SocketsService,
    private loader: LoaderService
  ) { }

  getCustomerData(): Promise<Customer[]> {
    this.loader.showLoader(true);
    return new Promise((resolve, reject) => {
      superagent
        .get(environment.backendServer + '/customers')
        .set('Authorization', `Bearer ${this.sockets.data.token}`)
        .on('progress', (e) => this.loader.pipe(e.percent))
        .end((error, response) => {
          if (response) {
            if (response.status === 200) {
              this.loader.showLoader(false);
              this.customers = response.body.customers;
              resolve(this.customers);
            } else {
              this.loader.showLoader(false, true);
              reject(response.status);
            }
          } else {
            reject(0);
            this.loader.showLoader(false, true);
          }
        });
    });
  }

  getCustomer(customerId: string): Promise<Customer> {
    return new Promise((resolve, reject) => {
      this.getCustomerData()
        .then((data: Customer[]) => {
          for (const customer of data) {
            if (customer.id === customerId) {
              resolve(customer);
              break;
            }
          }
        });
    });
  }
}
