import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent } from '@components';
import { NotificationService } from '../notifications/notification.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';

interface TeamResponse {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  callerRole: string;
  memberCount: number;
}

@Component({
  selector: 'app-create-team-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ButtonComponent,
  ],
  template: `
    <div class="page-shell">
      <div class="page-card">
        <h1 class="mat-headline-small">Create a team</h1>

        <form
          data-testid="create-team-form"
          [formGroup]="form"
          (ngSubmit)="submit()"
          novalidate
        >
          <mat-form-field appearance="outline" class="field">
            <mat-label>Team name</mat-label>
            <input
              matInput
              formControlName="name"
              data-testid="team-name-input"
              maxlength="50"
              [attr.aria-invalid]="isInvalid('name')"
              [attr.aria-describedby]="isInvalid('name') ? 'name-error' : null"
            />
            @if (isInvalid('name')) {
              <mat-error id="name-error" data-testid="name-error">
                Team name must be 3–50 characters
              </mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Description (optional)</mat-label>
            <textarea
              matInput
              formControlName="description"
              data-testid="description-input"
              rows="3"
              maxlength="200"
            ></textarea>
          </mat-form-field>

          <qq-button
            type="submit"
            variant="filled"
            class="submit-btn"
            data-testid="submit-button"
            [disabled]="form.invalid || loading()"
            [loading]="loading()"
          >
            Create team
          </qq-button>
        </form>

        <p class="back-link">
          <a routerLink="/teams">Back to teams</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page-shell {
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px 24px;
    }
    .page-card { width: 100%; max-width: 480px; }
    h1 { margin-bottom: 24px; }
    .field { width: 100%; margin-bottom: 8px; }
    .submit-btn { width: 100%; margin-bottom: 16px; }
    .back-link { text-align: center; font-size: 14px; }

    @media (min-width: 905px) {
      .page-card { max-width: 560px; }
    }
  `],
})
export class CreateTeamPage {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', Validators.maxLength(200)],
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { name, description } = this.form.getRawValue();
    this.loading.set(true);

    this.http.post<TeamResponse>(
      `${environment.apiBaseUrl}/teams`,
      { name: name!.trim(), description: description?.trim() || undefined },
    ).subscribe({
      next: team => {
        this.loading.set(false);
        this.auth.setLastTeam(team.id);
        this.notifications.show({ kind: 'success', message: `Team "${team.name}" created!` });
        this.router.navigate(['/teams', team.id]);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 422 || err.status === 400) {
          const errors = err.error?.errors;
          if (errors?.name) {
            this.form.get('name')?.setErrors({ server: errors.name[0] });
          } else {
            this.notifications.show({ kind: 'error', message: err.error?.detail ?? 'Validation failed.' });
          }
        } else if (err.status === 403) {
          this.notifications.show({ kind: 'error', message: err.error?.detail ?? 'Verify your email before creating a team.' });
        } else {
          this.notifications.show({ kind: 'error', message: 'Something went wrong. Please try again.' });
        }
      },
    });
  }
}
