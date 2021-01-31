import { SocketsService } from 'src/app/services/sockets.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RouterService {
  state: Subject<number> = new Subject<number>();
  constructor(
    private sockets: SocketsService
  ) { }
  routeToSlide(index) {
    this.state.next(index);
    // Change the location to the page name
    window.history.pushState('', ['Nextify for Partners | ', this.getPageNameFromIndex(index)].join(''), ['/dashboard', this.getPageNameFromIndex(index).toLowerCase()].join('/'));
  }

  getPageNameFromIndex(index: number): string {
    if (index === 0) {
      return 'Orders';
    } else if (index === 1) {
      return 'Products';
    } else if (index === 2) {
      return 'Extras';
    } else if (index === 3) {
      return 'Banners';
    } else if (index === 4) {
      return 'Promocodes';
    } else if (index === 5) {
      return 'Customers';
    } else if (index === 6) {
      return 'Drivers';
    } else if (index === 7) {
      return 'Reports';
    } else {
      return 'Profile';
    }
  }
}
