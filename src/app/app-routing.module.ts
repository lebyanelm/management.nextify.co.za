import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },
  {
    path: 'home',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    redirectTo: 'dashboard/orders',
    pathMatch: 'full'
  },
  {
    path: 'dashboard/:page',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'branch-selector',
    loadChildren: () => import('./pages/branch-selector/branch-selector.module').then( m => m.BranchSelectorPageModule)
  },
  {
    path: 'device-not-supported-yet',
    loadChildren: () => import('./pages/device-not-supported-yet/device-not-supported-yet.module').then( m => m.DeviceNotSupportedYetPageModule)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./pages/signin/signin.module').then( m => m.SigninPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/password-reset/password-reset.module').then( m => m.PasswordResetPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
