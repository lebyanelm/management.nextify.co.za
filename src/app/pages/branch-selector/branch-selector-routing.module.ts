import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BranchSelectorPage } from './branch-selector.page';

const routes: Routes = [
  {
    path: '',
    component: BranchSelectorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchSelectorPageRoutingModule {}
