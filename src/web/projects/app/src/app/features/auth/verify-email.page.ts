import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../notifications/notification.service';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        @if (status() === 'verifying') {
          <mat-spinner diameter="40" aria-label="Verifying…"></mat-spinner>
        } @else if (status() === 'success') {
          <h1 class="mat-headline-small">Email verified!</h1>
          <p>Your account is now active. You can sign in.</p>
          <a mat-flat-button routerLink="/auth/sign-in">Sign in</a>
        } @else {
          <h1 class="mat-headline-small">Verification failed</h1>
          <p>The link may have expired or already been used.</p>
          <a mat-stroked-button routerLink="/auth/sign-up">Back to sign up</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    h1 { margin: 0; }
  `],
})
export class VerifyEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly status = signal<'verifying' | 'success' | 'error'>('verifying');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.status.set('error'); return; }

    this.auth.verifyEmail(token).subscribe({
      next: () => {
        this.status.set('success');
        this.notifications.show({ kind: 'success', message: 'Email verified — welcome!' });
      },
      error: () => this.status.set('error'),
    });
  }
}
