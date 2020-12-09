import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  stateChange: Subject<boolean> = new Subject<boolean>();
  private s = false;
  constructor() { }
  set status(status: boolean) {
    this.s = status;
    this.stateChange.next(this.s);
  }

  get status() {
    return this.s;
  }
}
