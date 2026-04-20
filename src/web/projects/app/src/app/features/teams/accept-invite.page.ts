import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { EmptyStateComponent } from '@components';
import { NotificationService } from '../notifications/notification.service';
import { environment } from '../../../environments/environment';

interface InvitePreview {
  teamName: string;
  memberCount: number;
  teamId: string;
  isValid: boolean;
}

@Component({
  selector: 'app-accept-invite-page',
  standalone: true,
  imports: [MatButtonModule, EmptyStateComponent],
  template: `
    <div class="page-shell">
      @if (status() === 'loading') {
        <p>Loading invite…</p>
      } @else if (status() === 'invalid') {
        <qq-empty-state
          data-testid="invite-invalid"
          title="Invite no longer valid"
          description="This link has expired or been revoked."
        >
          <a slot="cta" [href]="contactHref()">Contact your team</a>
        </qq-empty-state>
      } @else if (status() === 'ready') {
        <div class="invite-preview" data-testid="invite-preview">
          <h1 class="mat-headline-small">You've been invited</h1>
          <p class="team-name" data-testid="team-preview-name">{{ preview()!.teamName }}</p>
          <p class="meta">{{ preview()!.memberCount }} member{{ preview()!.memberCount !== 1 ? 's' : '' }}</p>
          <button
            mat-flat-button
            color="primary"
            data-testid="accept-btn"
            [disabled]="accepting()"
            (click)="accept()"
          >
            Join team
          </button>
        </div>
      } @else if (status() === 'joined') {
        <p>Redirecting to team…</p>
      }
    </div>
  `,
  styles: [`
    .page-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .invite-preview { text-align: center; max-width: 400px; }
    h1 { margin-bottom: 8px; }
    .team-name { font-size: 20px; font-weight: 500; margin-bottom: 4px; }
    .meta { color: var(--mat-sys-on-surface-variant); margin-bottom: 24px; }
  `],
})
export class AcceptInvitePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);

  readonly status = signal<'loading' | 'invalid' | 'ready' | 'joined'>('loading');
  readonly preview = signal<InvitePreview | null>(null);
  readonly accepting = signal(false);

  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.loadPreview();
  }

  private loadPreview(): void {
    this.http.get<InvitePreview>(`${environment.apiBaseUrl}/invites/${this.token}`).subscribe({
      next: p => {
        this.preview.set(p);
        this.status.set(p.isValid ? 'ready' : 'invalid');
      },
      error: () => this.status.set('invalid'),
    });
  }

  accept(): void {
    this.accepting.set(true);
    this.http.post<{ teamId: string }>(`${environment.apiBaseUrl}/invites/${this.token}/accept`, {}).subscribe({
      next: res => {
        this.accepting.set(false);
        this.status.set('joined');
        this.notifications.show({ kind: 'success', message: `Welcome to ${this.preview()?.teamName ?? 'the team'}!` });
        this.router.navigate(['/teams', res.teamId]);
      },
      error: () => {
        this.accepting.set(false);
        this.status.set('invalid');
      },
    });
  }

  contactHref(): string {
    return `mailto:?subject=QuorumQ invite&body=My invite link expired. Please send a new one.`;
  }
}
