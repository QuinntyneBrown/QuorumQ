import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        auth.user.set(null);
        const isHydrationProbe = req.url.endsWith('/auth/me');
        const isAuthRoute = router.url.startsWith('/auth/');
        if (!isHydrationProbe && !isAuthRoute) {
          const returnUrl = router.url !== '/auth/sign-in' ? router.url : undefined;
          const extras = returnUrl ? { queryParams: { return: returnUrl } } : undefined;
          router.navigate(['/auth/sign-in'], extras);
        }
      }
      return throwError(() => err);
    }),
  );
};
