import { Injectable, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from './auth.service';
import { ThemeService } from '../theme/theme.service';

const LAST_TEAM_KEY = 'qq_last_team';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly user = signal<User | null | undefined>(undefined);
  readonly lastTeamId = signal<string | null>(localStorage.getItem(LAST_TEAM_KEY));
  readonly returnTo = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.lastTeamId();
      if (id) {
        localStorage.setItem(LAST_TEAM_KEY, id);
      } else {
        localStorage.removeItem(LAST_TEAM_KEY);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.user() !== null) {
        this.hydrate().subscribe();
      }
    });
  }

  hydrate(): Observable<User | null> {
    return this.http
      .get<User>(`${environment.apiBaseUrl}/auth/me`, { withCredentials: true })
      .pipe(
        tap(u => {
          this.user.set(u);
          this.themeService.init(u.preferences?.theme ?? 'system');
        }),
        catchError(() => {
          this.user.set(null);
          return of(null);
        }),
      );
  }

  setUser(user: User): void {
    this.user.set(user);
  }

  clearUser(): void {
    this.user.set(null);
    this.lastTeamId.set(null);
    this.returnTo.set(null);
  }

  requireAuth(route: string): boolean {
    if (this.user()) return true;
    this.returnTo.set(route);
    this.router.navigate(['/auth/sign-in'], { queryParams: { return: route } });
    return false;
  }
}
