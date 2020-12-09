import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BranchSelectorPageRoutingModule } from './branch-selector-routing.module';

import { BranchSelectorPage } from './branch-selector.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BranchSelectorPageRoutingModule
  ],
  declarations: [BranchSelectorPage]
})
export class BranchSelectorPageModule {}
