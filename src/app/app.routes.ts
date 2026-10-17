import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'otp',
    loadComponent: () =>
      import('./features/auth/pages/otp/otp.page').then((m) => m.OtpPage),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];


