import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserSummary {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  emailVerifiedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  readonly user = signal<UserSummary | null>(null);

  async signUp(email: string, password: string, displayName: string): Promise<UserSummary> {
    const result = await firstValueFrom(
      this.http.post<UserSummary>(`${this.baseUrl}/sign-up`, { email, password, displayName },
        { withCredentials: true })
    );
    this.user.set(result);
    return result;
  }

  async signIn(email: string, password: string): Promise<UserSummary> {
    const result = await firstValueFrom(
      this.http.post<UserSummary>(`${this.baseUrl}/sign-in`, { email, password },
        { withCredentials: true })
    );
    this.user.set(result);
    return result;
  }

  async signOut(): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/sign-out`, {}, { withCredentials: true })
    );
    this.user.set(null);
  }

  async loadMe(): Promise<UserSummary | null> {
    try {
      const result = await firstValueFrom(
        this.http.get<UserSummary>(`${this.baseUrl}/me`, { withCredentials: true })
      );
      this.user.set(result);
      return result;
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        this.user.set(null);
      }
      return null;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.baseUrl}/verify-email`, { token }, { withCredentials: true })
    );
    await this.loadMe();
  }
}
