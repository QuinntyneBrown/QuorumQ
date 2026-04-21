import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserPreferences {
  theme: 'system' | 'light' | 'dark';
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
  preferences: UserPreferences;
}

interface SignUpRequest { email: string; password: string; displayName: string; }
interface SignInRequest { email: string; password: string; }

const LAST_TEAM_KEY = 'qq_last_team';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  readonly user = signal<User | null>(null);

  setLastTeam(teamId: string): void {
    localStorage.setItem(LAST_TEAM_KEY, teamId);
  }

  getLastTeam(): string | null {
    return localStorage.getItem(LAST_TEAM_KEY);
  }

  clearLastTeam(): void {
    localStorage.removeItem(LAST_TEAM_KEY);
  }

  signUp(email: string, password: string, displayName: string): Observable<User> {
    return this.http.post<User>(`${this.base}/auth/sign-up`, { email, password, displayName } satisfies SignUpRequest).pipe(
      tap(u => this.user.set(u)),
    );
  }

  signIn(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.base}/auth/sign-in`, { email, password } satisfies SignInRequest, { withCredentials: true }).pipe(
      tap(u => this.user.set(u)),
    );
  }

  signOut(): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/sign-out`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.user.set(null);
        this.clearLastTeam();
      }),
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.base}/auth/me`, { withCredentials: true }).pipe(
      tap(u => this.user.set(u)),
    );
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/verify-email`, { token }, { withCredentials: true });
  }
}
