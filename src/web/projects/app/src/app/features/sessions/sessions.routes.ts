import { Routes } from '@angular/router';

export const sessionsRoutes: Routes = [
  {
    path: 'new',
    loadComponent: () =>
      import('./start-session.page').then(m => m.StartSessionPage),
  },
  {
    path: ':sessionId/winner',
    loadComponent: () =>
      import('./winner-reveal.page').then(m => m.WinnerRevealPage),
  },
  {
    path: ':sessionId',
    loadComponent: () =>
      import('./session.page').then(m => m.SessionPage),
  },
];
