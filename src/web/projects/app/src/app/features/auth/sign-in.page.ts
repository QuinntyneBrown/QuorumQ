import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent } from '@components';
import { AuthService } from '../../core/auth/auth.service';
import { SessionStore } from '../../core/auth/session.store';
import { NotificationService } from '../notifications/notification.service';

@Component({
  selector: 'app-sign-in-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ButtonComponent,
  ],
  template: `
    <div class="auth-shell">
      <div class="auth-card">
        <h1 class="mat-headline-small">Sign in</h1>

        @if (rateLimitSeconds() > 0) {
          <div class="rate-limit-banner" role="alert" data-testid="rate-limit-message">
            Too many failed attempts. Please wait
            <strong>{{ rateLimitSeconds() }}s</strong> before trying again.
          </div>
        }

        <form
          data-testid="sign-in-form"
          [formGroup]="form"
          (ngSubmit)="submit()"
          novalidate
          autocomplete="on"
        >
          <mat-form-field appearance="outline" class="field">
            <mat-label>Email</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              data-testid="email-input"
              autocomplete="email"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Password</mat-label>
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              data-testid="password-input"
              autocomplete="current-password"
            />
            <button
              type="button"
              mat-icon-button
              matSuffix
              (click)="showPassword.set(!showPassword())"
              [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
            >
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <qq-button
            type="submit"
            variant="filled"
            class="submit-btn"
            data-testid="submit-button"
            [disabled]="form.invalid || loading() || rateLimitSeconds() > 0"
            [loading]="loading()"
          >
            Sign in
          </qq-button>
        </form>

        <p class="links">
          <a routerLink="/auth/forgot-password" data-testid="forgot-password-link">Forgot password?</a>
        </p>
        <p class="links">
          Don't have an account?
          <a routerLink="/auth/sign-up">Sign up</a>
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
    .auth-card { width: 100%; max-width: 400px; }
    h1 { margin-bottom: 24px; }
    .field { width: 100%; margin-bottom: 8px; }
    .submit-btn { width: 100%; margin-bottom: 16px; }
    .links { text-align: center; font-size: 14px; margin-bottom: 8px; }
    .links a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 4px; }
    .rate-limit-banner {
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      font-size: 14px;
    }
  `],
})
export class SignInPage implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly rateLimitSeconds = signal(0);

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.rateLimitSeconds() > 0) { this.form.markAllAsTouched(); return; }
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);

    this.auth.signIn(email!, password!).subscribe({
      next: user => {
        this.loading.set(false);
        this.session.setUser(user);
        const lastTeam = this.auth.getLastTeam();
        const returnUrl = this.route.snapshot.queryParamMap.get('return');
        const dest = returnUrl ?? (lastTeam ? `/teams/${lastTeam}` : '/teams');
        this.router.navigateByUrl(dest);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.notifications.show({ kind: 'error', message: 'Invalid email or password.' });
        } else if (err.status === 429) {
          const retryAfter = parseInt(err.headers.get('Retry-After') ?? '60', 10);
          this.startCountdown(retryAfter);
        } else {
          this.notifications.show({ kind: 'error', message: 'Something went wrong. Please try again.' });
        }
      },
    });
  }

  private startCountdown(seconds: number): void {
    this.rateLimitSeconds.set(seconds);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      const next = this.rateLimitSeconds() - 1;
      if (next <= 0) {
        this.rateLimitSeconds.set(0);
        clearInterval(this.countdownTimer!);
        this.countdownTimer = null;
      } else {
        this.rateLimitSeconds.set(next);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
}
