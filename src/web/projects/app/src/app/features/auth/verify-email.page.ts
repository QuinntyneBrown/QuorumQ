import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card" data-testid="verify-email-page">
        @if (state() === 'pending') {
          <mat-card-content class="center">
            <mat-spinner diameter="40" />
            <p>Verifying your email…</p>
          </mat-card-content>
        } @else if (state() === 'success') {
          <mat-card-header>
            <mat-icon mat-card-avatar style="color: var(--mat-sys-primary)">check_circle</mat-icon>
            <mat-card-title>Email verified!</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Your email has been verified. You can now use all features.</p>
          </mat-card-content>
          <mat-card-actions>
            <a mat-flat-button routerLink="/teams">Go to app</a>
          </mat-card-actions>
        } @else {
          <mat-card-header>
            <mat-icon mat-card-avatar style="color: var(--mat-sys-error)">error</mat-icon>
            <mat-card-title>Verification failed</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>The verification link is invalid or has expired.</p>
          </mat-card-content>
          <mat-card-actions>
            <a mat-stroked-button routerLink="/auth/verify-email-sent">Resend verification</a>
          </mat-card-actions>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: flex-start; padding: 24px 16px; }
    .auth-card { width: 100%; max-width: 440px; }
    .center { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 32px 0; }
  `],
})
export class VerifyEmailPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly state = signal<'pending' | 'success' | 'error'>('pending');

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error');
      return;
    }
    try {
      await this.auth.verifyEmail(token);
      this.state.set('success');
    } catch {
      this.state.set('error');
    }
  }
}
