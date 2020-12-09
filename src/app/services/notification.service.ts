import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // tslint:disable: variable-name
  state: Subject<number> = new Subject<number>();
  driver_connected: Subject<number> = new Subject<number>();

  constructor() { }
  emit(i?: number) {
    this.state.next(i || 0);
  }

  driverConnected(count: number) {
    this.driver_connected.next(count);
  }

  message() {
    this.state.next(1);
  }
}
