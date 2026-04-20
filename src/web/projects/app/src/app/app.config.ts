import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideQuorumMaterialTheme } from '@components';
import { authInterceptor } from './core/api/interceptors/auth.interceptor';
import { SessionStore } from './core/auth/session.store';

import { routes } from './app.routes';

function hydrateSession(session: SessionStore): () => Promise<unknown> {
  return () => session.hydrate().toPromise();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideQuorumMaterialTheme(),
    {
      provide: APP_INITIALIZER,
      useFactory: hydrateSession,
      deps: [SessionStore],
      multi: true,
    },
  ]
};
