import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-verify-email-sent-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <h1 class="mat-headline-small">Check your inbox</h1>
        <p class="body">
          We sent a verification link to your email address.
          Click the link to activate your account — it expires in 24 hours.
        </p>
        <p class="hint">
          Didn't get it? Check your spam folder or
          <a routerLink="/auth/sign-up">try again</a>.
        </p>
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
    }
    h1 { margin-bottom: 16px; }
    .body { margin-bottom: 16px; }
    .hint { font-size: 14px; color: var(--mat-sys-on-surface-variant); }
  `],
})
export class VerifyEmailSentPage {}
