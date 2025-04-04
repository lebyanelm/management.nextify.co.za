import { Title } from '@angular/platform-browser';
import { StatusService } from './status.service';
import { ModalController } from '@ionic/angular';
import { SocketsService } from 'src/app/services/sockets.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  // tslint:disable: variable-name
  private _index;
  private _id;
  public onChange: Subject<null> = new Subject<null>();

  constructor(
    private sockets: SocketsService,
    private modalCtrl: ModalController,
    private status: StatusService,
    private title: Title
  ) {
    this.sockets.connected.subscribe(() => {
      if (this._index !== undefined) {
        this.index = this._index;
      }
    });
  }

  set index(index) {
    this._index = index;
    this._id = this.sockets.data.branches[index].id;
    this.sockets.branchId = this._id;
    this.onChange.next();

    // Send the selected branch to the backend server along with the connection ID.
    this.sockets.connection.emit('set branch', {
      partnerId: this.sockets.data.id,
      socketId: this.sockets.connection.id,
      branchId: this.id }, (state) => {
        this.modalCtrl.getTop()
          .then((modal) => {
            if (modal) {
              modal.dismiss();
            }

            this.title.setTitle([this.title.getTitle().split(' | ')[0], [this.sockets.data.businessName, '(' + this.sockets.data.branches[this._index].name.trim() + ')'].join(' ')].join(' | '));
          })
        this.status.status = true;
      });
  }

  get index() {
    return this._index;
  }

  get id() {
    return this._id;
  }
}
