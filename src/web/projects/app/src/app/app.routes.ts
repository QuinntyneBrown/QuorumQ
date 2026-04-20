import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'teams',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'teams',
    loadChildren: () =>
      import('./features/teams/teams.routes').then(m => m.teamsRoutes),
  },
  {
    path: 'teams/:teamId/sessions',
    loadChildren: () =>
      import('./features/sessions/sessions.routes').then(m => m.sessionsRoutes),
  },
  {
    path: 'history',
    loadChildren: () =>
      import('./features/history/history.routes').then(m => m.historyRoutes),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.routes').then(m => m.settingsRoutes),
  },
  {
    path: '_gallery',
    loadComponent: () =>
      import('./features/shared/gallery.page').then(m => m.GalleryPageComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/shared/not-found.page').then(m => m.NotFoundPageComponent),
  },
];
