import { Customer } from './../../interfaces/Customer';
import { LoaderService } from './../../services/loader.service';
import { SocketsService } from 'src/app/services/sockets.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-accounts',
  templateUrl: './user-accounts.component.html',
  styleUrls: ['./user-accounts.component.scss'],
})
export class UserAccountsComponent implements OnInit, AfterViewInit {
  @ViewChild('SearchInput', { static: false }) searchInput: ElementRef<HTMLInputElement>;
  
  customers: Customer[] = [];
  searchList: Customer[] = [];

  constructor(
    public sockets: SocketsService,
    public loader: LoaderService
  ) { }

  ngOnInit() {
    const awaiter = setInterval(() => {
      if (this.sockets.data) {
        // this.getCustomerData();
        clearInterval(awaiter);
      }
    });
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.onkeyup = () => {
      this.searchList = [];
      if (this.searchInput.nativeElement.value.length && this.customers.length) {
        const keyword = this.searchInput.nativeElement.value, 
              scan = (object) => {
                for (let property in object) {
                  if (typeof object[property] === 'string') {
                    if (object[property].toString().toLowerCase().includes(keyword)) {
                      const isFound = this.searchList.find((customer) => customer.id === object.id);
                      if (!isFound) {
                        this.searchList.push(object);
                      }
                    }
                  }
                }
              }
        this.customers.forEach((customer) => {
          scan(customer);
        });
      }
    }
  }

  getCustomerData() {
    superagent
      .get(environment.backendServer + '/customers')
      .set('Authorization', `Bearer ${this.sockets.data.token}`)
      .on('progress', (e) => this.loader.pipe(e.percent))
      .end((error, response) => {
        if (response) {
          if (response.status === 200) {
            this.customers = response.body.customers;
          }
        }
      });
  }
}
