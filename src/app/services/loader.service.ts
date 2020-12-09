import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // tslint:disable-next-line: max-line-length
  public state: Subject<{state: boolean, isModal: boolean, isError: boolean}> = new Subject<{state: boolean, isModal: boolean, isError: boolean}>();
  public progress: Subject<number> = new Subject<number>();
  constructor() { }
  showLoader(state, isError = false) {
    this.state.next({state, isModal: false, isError});
  }

  showModalLoader(state, isError = false) {
    this.state.next({state, isModal: true, isError});
  }

  pipe(progress: number) {
    this.progress.next(progress);
  }
}
