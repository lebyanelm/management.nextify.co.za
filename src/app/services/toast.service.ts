import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { ToastOptions, AlertOptions } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})

export class ToastService {
  constructor(private toastCtrl: ToastController, private alertCtrl: AlertController) { }

  async show(message: string, options: ToastOptions = {}, isRemovable = true) {
    options = {
      ...options,
      message,
      cssClass: 'base-toast',
      position: 'top'
    };

    if (!options.buttons && !options.duration) {
      options.duration = 3000;
    }

    const toast = await this.toastCtrl.create(options);
    toast.present();

    return toast;
  }

  async showAlert(options: AlertOptions) {
    const alert = await this.alertCtrl.create({...options, cssClass: 'alert'});
    alert.present();

    return alert;
  }
}