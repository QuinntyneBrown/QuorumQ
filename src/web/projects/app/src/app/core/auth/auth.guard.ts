import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from './session.store';

export const authGuard: CanActivateFn = (route, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);

  if (session.user()) return true;

  return router.createUrlTree(['/auth/sign-in'], {
    queryParams: { return: state.url },
  });
};
