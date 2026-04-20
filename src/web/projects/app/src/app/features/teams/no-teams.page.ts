import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyStateComponent } from '@components';
import { SessionStore } from '../../core/auth/session.store';

@Component({
  selector: 'app-no-teams-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    EmptyStateComponent,
  ],
  template: `
    @if (session.user()?.emailVerified === false) {
      <div class="verify-banner" data-testid="verify-email-banner" role="alert">
        Please verify your email address to unlock all features.
      </div>
    }
    <div class="page-shell">
      <qq-empty-state
        title="You're not in any team yet"
        description="Create a new team or use an invite link to join an existing one."
      >
        <div slot="cta" class="cta-group">
          <a
            mat-flat-button
            color="primary"
            routerLink="/teams/new"
            data-testid="create-team-cta"
          >
            Create a team
          </a>
          <button
            mat-stroked-button
            data-testid="have-invite-btn"
            (click)="showInput.set(true)"
          >
            I have an invite link
          </button>
        </div>
      </qq-empty-state>

      @if (showInput()) {
        <div class="invite-input-row">
          <mat-form-field appearance="outline" class="invite-field">
            <mat-label>Invite link</mat-label>
            <input
              matInput
              data-testid="invite-link-input"
              placeholder="Paste invite link…"
              [formControl]="inviteLinkControl"
              (keydown.enter)="followInvite()"
            />
          </mat-form-field>
          <button
            mat-flat-button
            color="primary"
            data-testid="go-btn"
            [disabled]="!inviteLinkControl.value"
            (click)="followInvite()"
          >
            Go
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .verify-banner { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); padding: 12px 24px; text-align: center; font-size: 14px; }
    .page-shell { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; gap: 24px; }
    .cta-group { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .invite-input-row { display: flex; align-items: flex-start; gap: 8px; width: 100%; max-width: 480px; }
    .invite-field { flex: 1; }
  `],
})
export class NoTeamsPage {
  private readonly router = inject(Router);
  readonly session = inject(SessionStore);

  readonly showInput = signal(false);
  readonly inviteLinkControl = new FormControl('');

  followInvite(): void {
    const url = this.inviteLinkControl.value?.trim() ?? '';
    if (!url) return;
    try {
      const parsed = new URL(url);
      const path = parsed.pathname;
      this.router.navigateByUrl(path);
    } catch {
      this.router.navigateByUrl(url);
    }
  }
}
