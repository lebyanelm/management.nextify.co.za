import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeviceNotSupportedYetPage } from './device-not-supported-yet.page';

const routes: Routes = [
  {
    path: '',
    component: DeviceNotSupportedYetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeviceNotSupportedYetPageRoutingModule {}
