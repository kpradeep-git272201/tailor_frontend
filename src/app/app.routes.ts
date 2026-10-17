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
    path: 'fabrics',
    loadComponent: () =>
      import('./features/fabrics/pages/fabric-list/fabric-list.page').then(
        (m) => m.FabricListPage
      ),
  },
  {
    path: 'tailors',
    loadComponent: () =>
      import('./features/tailors/pages/tailor-list/tailor-list.page').then(
        (m) => m.TailorListPage
      ),
  },
  {
    path: 'otp',
    loadComponent: () =>
      import('./features/auth/pages/otp/otp.page').then((m) => m.OtpPage),
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('./features/article/pages/articles/articles.page').then(
        (m) => m.ArticlesPage
      ),
  },
  {
    path: 'articles',
    loadComponent: () =>
      import('./features/article/pages/articles/articles.page').then(
        (m) => m.ArticlesPage
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];


