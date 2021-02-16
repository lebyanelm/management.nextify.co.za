import { ToastMessage } from './../interfaces/ToastMessage';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { ToastOptions, AlertOptions } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})

export class ToastService {
  public onToastMessage: Subject<any> = new Subject<any>();
  public onToastRemove: Subject<number> = new Subject<number>();
  constructor(private toastCtrl: ToastController, private alertCtrl: AlertController) { }

  async show(message: string, options: ToastOptions = {}, isRemovable = true) {
    return new Promise((resolve, reject) => {
      const toastMessage: any = {
        message,
        button: options.buttons ? options.buttons[0] : null,
        timeout: options.duration || 0 };
      this.onToastMessage.next({ toastMessage, callback: (index) => { resolve(index); } });
    });
  }

  async showAlert(options: AlertOptions) {
    const alert = await this.alertCtrl.create({...options, cssClass: 'alert'});
    alert.present();

    return alert;
  }

  close(index: number) {
    this.onToastRemove.next(index || 0);
  }
}