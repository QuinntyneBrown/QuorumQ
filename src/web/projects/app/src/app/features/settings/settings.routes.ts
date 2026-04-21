import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings.page').then(m => m.SettingsPage),
    children: [
      { path: '', redirectTo: 'account', pathMatch: 'full' },
      {
        path: 'account',
        loadComponent: () => import('./account.page').then(m => m.AccountPage),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications-stub.page').then(m => m.NotificationsStubPage),
      },
      {
        path: 'theme',
        loadComponent: () => import('./theme.page').then(m => m.ThemePage),
      },
    ],
  },
];
