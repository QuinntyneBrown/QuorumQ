import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings.page').then(m => m.SettingsPage),
    children: [
      { path: '', redirectTo: 'account', pathMatch: 'full' },
      {
        path: 'account',
        loadComponent: () => import('./delete-account.page').then(m => m.DeleteAccountPage),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notification-settings.page').then(m => m.NotificationSettingsPage),
      },
      {
        path: 'theme',
        loadComponent: () => import('./theme.page').then(m => m.ThemePage),
      },
    ],
  },
];
