import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent } from '@components';
import { AuthService } from '../../core/auth/auth.service';
import { SessionStore } from '../../core/auth/session.store';
import { NotificationService } from '../notifications/notification.service';

function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (v.length < 10) return { strength: true };
  if (!/[A-Z]/.test(v)) return { strength: true };
  if (!/[a-z]/.test(v)) return { strength: true };
  if (!/[0-9]/.test(v)) return { strength: true };
  if (!/[^A-Za-z0-9]/.test(v)) return { strength: true };
  return null;
}

@Component({
  selector: 'app-sign-up-page',
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
        <h1 class="mat-headline-small">Start eating together</h1>

        <form
          data-testid="sign-up-form"
          [formGroup]="form"
          (ngSubmit)="submit()"
          novalidate
          autocomplete="on"
        >
          <mat-form-field appearance="outline" class="field">
            <mat-label>Display name</mat-label>
            <input
              matInput
              formControlName="displayName"
              data-testid="display-name-input"
              autocomplete="name"
              [attr.aria-invalid]="isInvalid('displayName')"
              [attr.aria-describedby]="isInvalid('displayName') ? 'dn-error' : null"
            />
            @if (isInvalid('displayName')) {
              <mat-error id="dn-error">Name must be 2–40 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Email</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              data-testid="email-input"
              autocomplete="email"
              [attr.aria-invalid]="isInvalid('email')"
              [attr.aria-describedby]="isInvalid('email') ? 'email-error' : null"
            />
            @if (isInvalid('email')) {
              <mat-error id="email-error">Enter a valid email address</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Password</mat-label>
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              data-testid="password-input"
              autocomplete="new-password"
              [attr.aria-invalid]="isInvalid('password')"
              [attr.aria-describedby]="'pw-rules'"
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
            @if (isInvalid('password')) {
              <mat-error data-testid="password-error">Password must be at least 10 characters and include uppercase, lowercase, digit and special character</mat-error>
            }
          </mat-form-field>

          <ul
            id="pw-rules"
            role="list"
            aria-live="polite"
            class="pw-rules"
            aria-label="Password requirements"
          >
            <li [class.met]="meets('length')">{{ meets('length') ? '✓' : '✗' }} At least 10 characters</li>
            <li [class.met]="meets('upper')">{{ meets('upper') ? '✓' : '✗' }} One uppercase letter</li>
            <li [class.met]="meets('lower')">{{ meets('lower') ? '✓' : '✗' }} One lowercase letter</li>
            <li [class.met]="meets('digit')">{{ meets('digit') ? '✓' : '✗' }} One number</li>
            <li [class.met]="meets('special')">{{ meets('special') ? '✓' : '✗' }} One special character</li>
          </ul>

          <qq-button
            type="submit"
            variant="filled"
            class="submit-btn"
            data-testid="submit-button"
            [disabled]="loading()"
            [loading]="loading()"
          >
            Create account
          </qq-button>
        </form>

        <p class="sign-in-link">
          Already have an account?
          <a routerLink="/auth/sign-in">Sign in</a>
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
    h1 { margin-bottom: 24px; }
    .field { width: 100%; margin-bottom: 8px; }
    .pw-rules {
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
      font-size: 13px;
    }
    .pw-rules li { color: var(--mat-sys-error); }
    .pw-rules li.met { color: var(--mat-sys-primary); }
    .submit-btn { width: 100%; margin-bottom: 16px; }
    .sign-in-link { text-align: center; font-size: 14px; }

    @media (min-width: 905px) {
      .auth-card { max-width: 480px; }
    }
  `],
})
export class SignUpPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrength]],
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  meets(rule: string): boolean {
    const v: string = this.form.get('password')?.value ?? '';
    switch (rule) {
      case 'length': return v.length >= 10;
      case 'upper': return /[A-Z]/.test(v);
      case 'lower': return /[a-z]/.test(v);
      case 'digit': return /[0-9]/.test(v);
      case 'special': return /[^A-Za-z0-9]/.test(v);
      default: return false;
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password, displayName } = this.form.getRawValue();
    this.loading.set(true);

    this.auth.signUp(email!, password!, displayName!).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.session.setUser(user);
        this.router.navigate(['/auth/verify-email-sent']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 400 || err.status === 409) {
          this.notifications.show({ kind: 'error', message: err.error?.detail ?? 'Sign-up failed. Please check your details.' });
        } else {
          this.notifications.show({ kind: 'error', message: 'Something went wrong. Please try again.' });
        }
      },
    });
  }
}
