import { Routes } from '@angular/router';

export const teamsRoutes: Routes = [
  {
    path: 'new',
    loadComponent: () => import('./create-team.page').then(m => m.CreateTeamPage),
  },
  {
    path: ':teamId',
    loadComponent: () => import('./team-dashboard.page').then(m => m.TeamDashboardPage),
  },
  {
    path: '',
    loadComponent: () => import('./teams-list.page').then(m => m.TeamsListPage),
  },
];
