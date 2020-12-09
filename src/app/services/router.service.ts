import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  state: Subject<number> = new Subject<number>();
  constructor() { }
  routeToSlide(index) {
    this.state.next(index);
  }
}
