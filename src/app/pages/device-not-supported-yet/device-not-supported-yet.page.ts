import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-device-not-supported-yet',
  templateUrl: './device-not-supported-yet.page.html',
  styleUrls: ['./device-not-supported-yet.page.scss'],
})
export class DeviceNotSupportedYetPage implements OnInit {

  constructor(
    private platform: Platform,
    private router: Router) { }

  ngOnInit() {
    if (this.platform.width() >= 1030) {
      this.router.navigate(['/']);
    }
  }

}
