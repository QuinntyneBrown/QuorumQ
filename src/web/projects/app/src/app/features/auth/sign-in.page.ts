import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent } from '@components';
import { AuthService } from '../../core/auth/auth.service';
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
            [disabled]="form.invalid || loading()"
            [loading]="loading()"
          >
            Sign in
          </qq-button>
        </form>

        <p class="sign-up-link">
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
    .sign-up-link { text-align: center; font-size: 14px; }
  `],
})
export class SignInPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);

    this.auth.signIn(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.notifications.show({ kind: 'error', message: 'Invalid email or password.' });
        } else if (err.status === 429) {
          this.notifications.show({ kind: 'error', message: 'Too many attempts. Try again later.' });
        } else {
          this.notifications.show({ kind: 'error', message: 'Something went wrong. Please try again.' });
        }
      },
    });
  }
}
