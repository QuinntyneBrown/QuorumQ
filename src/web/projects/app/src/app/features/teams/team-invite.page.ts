import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ConfirmDialogComponent, ConfirmDialogData, EmptyStateComponent } from '@components';
import { NotificationService } from '../notifications/notification.service';
import { environment } from '../../../environments/environment';

interface InviteItem {
  id: string;
  tokenPrefix: string;
  url: string;
  expiresAt: string;
  revokedAt: string | null;
}

@Component({
  selector: 'app-team-invite-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, EmptyStateComponent],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <h1 class="mat-headline-small">Invite members</h1>
        <button
          mat-flat-button
          color="primary"
          data-testid="generate-invite-btn"
          [disabled]="generating()"
          (click)="generateInvite()"
        >
          <mat-icon>add_link</mat-icon>
          Generate invite
        </button>
      </div>

      @if (activeInvites().length === 0) {
        <qq-empty-state
          title="No active invites"
          description="Generate a link to invite people to this team."
        />
      } @else {
        <ul class="invite-list" data-testid="invite-list">
          @for (invite of activeInvites(); track invite.id) {
            <li class="invite-row">
              <span class="invite-token" data-testid="invite-token-prefix">{{ invite.tokenPrefix }}</span>
              <span class="invite-expiry">Expires {{ formatDate(invite.expiresAt) }}</span>
              <div class="invite-actions">
                <button
                  mat-icon-button
                  title="Copy invite link"
                  data-testid="copy-invite-btn"
                  (click)="copyLink(invite)"
                >
                  <mat-icon>content_copy</mat-icon>
                </button>
                <button
                  mat-icon-button
                  title="Revoke invite"
                  data-testid="revoke-invite-btn"
                  (click)="revokeInvite(invite)"
                >
                  <mat-icon>link_off</mat-icon>
                </button>
              </div>
            </li>
          }
        </ul>
      }

      <p class="back-link">
        <a [routerLink]="['/teams', teamId()]">Back to dashboard</a>
      </p>
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; max-width: 800px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    h1 { margin: 0; }
    .invite-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .invite-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 8px; }
    .invite-token { font-family: monospace; font-size: 13px; flex: 1; }
    .invite-expiry { font-size: 12px; color: var(--mat-sys-on-surface-variant); white-space: nowrap; }
    .invite-actions { display: flex; gap: 4px; }
    .back-link { margin-top: 24px; font-size: 14px; }
  `],
})
export class TeamInvitePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  readonly teamId = signal<string>('');
  readonly invites = signal<InviteItem[]>([]);
  readonly generating = signal(false);

  readonly activeInvites = () =>
    this.invites().filter(i => !i.revokedAt && new Date(i.expiresAt) > new Date());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('teamId') ?? '';
    this.teamId.set(id);
    this.loadInvites();
  }

  loadInvites(): void {
    this.http.get<InviteItem[]>(`${environment.apiBaseUrl}/teams/${this.teamId()}/invites`).subscribe({
      next: items => this.invites.set(items),
      error: () => {},
    });
  }

  generateInvite(): void {
    this.generating.set(true);
    this.http.post<InviteItem>(`${environment.apiBaseUrl}/teams/${this.teamId()}/invites`, {}).subscribe({
      next: invite => {
        this.generating.set(false);
        this.invites.update(list => [invite, ...list]);
        this.notifications.show({ kind: 'success', message: 'Invite link generated.' });
      },
      error: () => {
        this.generating.set(false);
        this.notifications.show({ kind: 'error', message: 'Could not generate invite.' });
      },
    });
  }

  copyLink(invite: InviteItem): void {
    navigator.clipboard.writeText(invite.url).then(() => {
      this.notifications.show({ kind: 'success', message: 'Invite link copied to clipboard.' });
    });
  }

  revokeInvite(invite: InviteItem): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Revoke invite',
          message: 'This link will stop working immediately. Are you sure?',
          confirmLabel: 'Revoke',
          destructive: true,
        },
      },
    );

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.http.post(`${environment.apiBaseUrl}/invites/${invite.id}/revoke`, {}).subscribe({
        next: () => {
          this.invites.update(list =>
            list.map(i => i.id === invite.id ? { ...i, revokedAt: new Date().toISOString() } : i),
          );
          this.notifications.show({ kind: 'success', message: 'Invite revoked.' });
        },
        error: () => {
          this.notifications.show({ kind: 'error', message: 'Could not revoke invite.' });
        },
      });
    });
  }

  formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
