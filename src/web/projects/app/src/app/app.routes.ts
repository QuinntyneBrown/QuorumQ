import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { authGuard } from './core/auth/auth.guard';

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
    path: 'teams/:teamId/sessions',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/sessions/sessions.routes').then(m => m.sessionsRoutes),
  },
  {
    path: 'teams/:teamId/restaurants/:restaurantId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/history/restaurant-profile.page').then(m => m.RestaurantProfilePage),
  },
  {
    path: 'teams',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/teams/teams.routes').then(m => m.teamsRoutes),
  },
  {
    path: 'invites/:token',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/teams/accept-invite.page').then(m => m.AcceptInvitePage),
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/history/history.routes').then(m => m.historyRoutes),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/settings/settings.routes').then(m => m.settingsRoutes),
  },
  ...(environment.e2eHooks ? [{
    path: '_test/notify',
    loadComponent: () =>
      import('./features/notifications/test-notify.page').then(m => m.TestNotifyPage),
  }] : []),
  {
    path: '_gallery',
    loadComponent: () =>
      import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/shared/not-found.page').then(m => m.NotFoundPageComponent),
  },
];
