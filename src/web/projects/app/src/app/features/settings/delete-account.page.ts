import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@components';
import { SessionStore } from '../../core/auth/session.store';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-delete-account-page',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  template: `
    <div class="tab-content" data-testid="account-tab">
      <h2 class="mat-title-medium">Account</h2>

      @if (session.user(); as user) {
        <p class="mat-body-medium email-display" data-testid="user-email">{{ user.email }}</p>
        <p class="mat-body-medium" data-testid="user-name">{{ user.displayName }}</p>
      }

      <div class="danger-zone" data-testid="danger-zone">
        <h3 class="mat-title-small danger-title">Danger zone</h3>
        <p class="mat-body-small hint">
          Permanently delete your account and all associated data.
          This action cannot be undone.
        </p>
        <button
          mat-stroked-button
          color="warn"
          (click)="openDeleteDialog()"
          data-testid="delete-account-btn"
        >
          Delete account
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tab-content { padding: 24px 0; }
    h2 { margin: 0 0 12px; }
    .email-display { font-weight: 500; }
    .danger-zone {
      margin-top: 32px;
      border: 1px solid var(--mat-sys-error);
      border-radius: 8px;
      padding: 16px;
    }
    .danger-title { color: var(--mat-sys-error); margin: 0 0 8px; }
    .hint { color: var(--mat-sys-on-surface-variant); margin: 0 0 16px; }
  `],
})
export class DeleteAccountPage {
  readonly session = inject(SessionStore);
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  openDeleteDialog(): void {
    const user = this.session.user();
    if (!user) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete account',
        message: `This will permanently delete your account and sign you out. Type your email "${user.email}" in the confirmation below to continue.`,
        confirmLabel: 'Delete my account',
        destructive: true,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.http
        .delete(`${environment.apiBaseUrl}/auth/me`)
        .subscribe({
          next: () => {
            this.session.clearUser();
            this.router.navigate(['/auth/sign-in'], {
              queryParams: { farewell: '1' },
            });
          },
          error: () => {},
        });
    });
  }
}
