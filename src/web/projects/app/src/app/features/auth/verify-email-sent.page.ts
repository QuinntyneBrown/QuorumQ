import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../notifications/notification.service';

@Component({
  selector: 'app-verify-email-sent-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card" data-testid="verify-email-sent">
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">mark_email_unread</mat-icon>
          <mat-card-title>Verify your email</mat-card-title>
          <mat-card-subtitle>Check your inbox</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <p>
            We sent a verification link to
            <strong>{{ email() }}</strong>.
            Click the link to activate your account.
          </p>
          <p class="hint">Didn't receive it? Check your spam folder or resend below.</p>
        </mat-card-content>

        <mat-card-actions>
          <button mat-stroked-button (click)="resend()" [disabled]="resent()">
            {{ resent() ? 'Email sent' : 'Resend verification email' }}
          </button>
          <a mat-button routerLink="/teams">Continue to app</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 24px 16px;
    }
    .auth-card { width: 100%; max-width: 440px; }
    .hint { opacity: 0.6; font-size: 0.875rem; }
    mat-card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  `],
})
export class VerifyEmailSentPage {
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);

  readonly email = () => this.auth.user()?.email ?? '';
  readonly resent = signal(false);

  resend(): void {
    this.resent.set(true);
    this.notify.show({ message: 'Verification email sent.', kind: 'success' });
  }
}
