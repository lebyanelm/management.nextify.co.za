import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
  { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  { path: 'accounts', loadChildren: () => import('./pages/accounts/accounts.module').then( m => m.AccountsPageModule)},
  {
    path: 'branch-selector',
    loadChildren: () => import('./pages/branch-selector/branch-selector.module').then( m => m.BranchSelectorPageModule)
  },
  {
    path: 'device-not-supported-yet',
    loadChildren: () => import('./pages/device-not-supported-yet/device-not-supported-yet.module').then( m => m.DeviceNotSupportedYetPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
