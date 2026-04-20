import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../notifications/notification.service';
import { ButtonComponent } from '@components';
import { HttpErrorResponse } from '@angular/common/http';

function passwordComplexity(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (!v) return null;
  const hasLetter = /[a-zA-Z]/.test(v);
  const hasDigit = /[0-9]/.test(v);
  const hasSpecial = /[^a-zA-Z0-9]/.test(v);
  if (!hasLetter || !hasDigit || !hasSpecial) {
    return { complexity: 'Password must include letters, numbers, and special characters.' };
  }
  return null;
}

function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ButtonComponent,
  ],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Create account</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate data-testid="sign-up-form">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                autocomplete="email"
                data-testid="email-input"
                [attr.aria-invalid]="emailErr ? 'true' : null"
              />
              @if (emailErr) {
                <mat-error data-testid="email-error">{{ emailErr }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                autocomplete="new-password"
                data-testid="password-input"
                [attr.aria-invalid]="passwordErr ? 'true' : null"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                (click)="showPassword.update(v => !v)"
              >
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (passwordErr) {
                <mat-error data-testid="password-error">{{ passwordErr }}</mat-error>
              }
            </mat-form-field>

            <div class="strength-meter" aria-hidden="true" data-testid="strength-meter">
              @for (i of [0, 1, 2, 3]; track i) {
                <div class="strength-meter__bar"
                  [class.strength-meter__bar--active]="strength() > i"
                  [class.strength-meter__bar--weak]="strength() <= 1"
                  [class.strength-meter__bar--ok]="strength() === 2 || strength() === 3"
                  [class.strength-meter__bar--strong]="strength() === 4"
                ></div>
              }
              <span class="strength-meter__label">
                {{ strengthLabel() }}
              </span>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Display name</mat-label>
              <input
                matInput
                type="text"
                formControlName="displayName"
                autocomplete="name"
                data-testid="display-name-input"
                [attr.aria-invalid]="displayNameErr ? 'true' : null"
              />
              @if (displayNameErr) {
                <mat-error data-testid="display-name-error">{{ displayNameErr }}</mat-error>
              }
            </mat-form-field>

            @if (serverError()) {
              <p class="server-error" role="alert" data-testid="server-error">{{ serverError() }}</p>
            }

            <qq-button
              variant="filled"
              [loading]="submitting()"
              data-testid="submit-button"
            >
              Create account
            </qq-button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <a routerLink="/auth/sign-in">Already have an account? Sign in</a>
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
      min-height: 100%;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
    }
    .full-width { width: 100%; }
    mat-form-field { margin-bottom: 4px; }
    qq-button { width: 100%; margin-top: 8px; }
    .strength-meter {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: -8px 0 16px;
    }
    .strength-meter__bar {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: var(--mat-sys-surface-variant);
      transition: background 0.2s;
    }
    .strength-meter__bar--active.strength-meter__bar--weak { background: var(--mat-sys-error); }
    .strength-meter__bar--active.strength-meter__bar--ok { background: var(--mat-sys-tertiary); }
    .strength-meter__bar--active.strength-meter__bar--strong { background: var(--mat-sys-primary); }
    .strength-meter__label { font-size: 0.75rem; color: var(--mat-sys-on-surface-variant); min-width: 60px; }
    .server-error { color: var(--mat-sys-error); font-size: 0.875rem; margin: 8px 0; }
  `],
})
export class SignUpPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly serverError = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10), passwordComplexity]],
    displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
  });

  readonly strength = () => passwordStrength(this.form.controls.password.value);

  readonly strengthLabel = () => {
    const s = this.strength();
    if (s === 0) return '';
    if (s === 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  };

  get emailErr(): string {
    const c = this.form.controls.email;
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Email is required.';
    if (c.errors['email']) return 'Enter a valid email address.';
    return '';
  }

  get passwordErr(): string {
    const c = this.form.controls.password;
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Password is required.';
    if (c.errors['minlength']) return 'Password must be at least 10 characters.';
    if (c.errors['complexity']) return c.errors['complexity'];
    return '';
  }

  get displayNameErr(): string {
    const c = this.form.controls.displayName;
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Display name is required.';
    if (c.errors['minlength']) return 'Display name must be at least 2 characters.';
    if (c.errors['maxlength']) return 'Display name must be 40 characters or fewer.';
    return '';
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.serverError.set('');

    try {
      const { email, password, displayName } = this.form.getRawValue();
      await this.auth.signUp(email, password, displayName);
      this.notify.show({ message: 'Account created! Please verify your email.', kind: 'success' });
      await this.router.navigate(['/auth/verify-email-sent']);
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 409) {
          this.serverError.set('This email is already registered.');
        } else if (err.status === 400 && err.error?.errors) {
          const errors = err.error.errors as Record<string, string[]>;
          const messages = Object.values(errors).flat().join(' ');
          this.serverError.set(messages);
        } else {
          this.serverError.set('Something went wrong. Please try again.');
        }
      }
    } finally {
      this.submitting.set(false);
    }
  }
}
