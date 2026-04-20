import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'sign-up',
    loadComponent: () => import('./sign-up.page').then(m => m.SignUpPage),
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./sign-in.page').then(m => m.SignInPage),
  },
  {
    path: 'verify-email-sent',
    loadComponent: () => import('./verify-email-sent.page').then(m => m.VerifyEmailSentPage),
  },
  {
    path: 'verify',
    loadComponent: () => import('./verify-email.page').then(m => m.VerifyEmailPage),
  },
];
