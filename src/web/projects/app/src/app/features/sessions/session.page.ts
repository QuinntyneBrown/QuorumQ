import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { SessionCardComponent, CountdownComponent, SessionStatus, ConfirmDialogComponent } from '@components';
import { PresenceComponent } from './presence.component';
import { SuggestRestaurantComponent } from '../suggestions/suggest-restaurant.component';
import { SuggestionListComponent } from '../suggestions/suggestion-list.component';
import { TieBreakBannerComponent } from '../voting/tie-break-banner.component';
import { SessionStore } from '../../core/auth/session.store';
import { SessionHubClient } from '../../core/realtime/session-hub.client';
import { environment } from '../../../environments/environment';

interface TieBreakInfo {
  active: boolean;
  tiedSuggestionIds: string[];
  deadline: string;
}

interface SessionDetail {
  id: string;
  teamId: string;
  state: string;
  deadline: string;
  startedAt: string;
  startedBy: string;
  suggestionCount: number;
  winnerName?: string;
  winnerChosenAtRandom?: boolean;
  tieBreak?: TieBreakInfo;
}

@Component({
  selector: 'app-session-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatChipsModule, SessionCardComponent, CountdownComponent, PresenceComponent, SuggestRestaurantComponent, SuggestionListComponent, TieBreakBannerComponent],
  template: `
    <div class="page-shell">
      @if (!hub.isConnected() && session()) {
        <div class="reconnecting-pill" data-testid="reconnecting-pill" role="status">
          Reconnecting…
        </div>
      }

      @if (session()) {
        <qq-session-card
          data-testid="session-card"
          [title]="sessionTitle()"
          [status]="sessionStatus()"
        >
          @if (isActive()) {
            <qq-countdown slot="countdown" [deadline]="tieBreakDeadline() ?? session()!.deadline" />
          }
          <div slot="actions">
            @if (isOrganizer() && session()!.state === 'Suggesting') {
              <button
                mat-flat-button
                color="primary"
                (click)="startVoting()"
                data-testid="start-voting-btn"
              >
                Start voting
              </button>
            }
            @if (isOrganizer() && isActive()) {
              <button
                mat-stroked-button
                color="warn"
                (click)="cancelSession()"
                data-testid="cancel-session-btn"
              >
                Cancel session
              </button>
            }
            <a
              mat-stroked-button
              [routerLink]="['/teams', session()!.teamId]"
              data-testid="back-to-team-btn"
            >
              Back to team
            </a>
          </div>
        </qq-session-card>

        @if (isTieBreak()) {
          <app-tie-break-banner
            data-testid="tie-break-banner"
            [deadline]="tieBreakDeadline()!"
          />
        }

        @if (isCancelled()) {
          <div class="cancelled-banner" data-testid="cancelled-banner" role="alert">
            This session was cancelled.
          </div>
        }

        <div class="content-slots">
          <section class="slot" data-testid="suggestions-slot">
            @if (session()) {
              <app-suggest-restaurant
                [sessionId]="session()!.id"
                [teamId]="session()!.teamId"
                [disabled]="isSuggestingDisabled()"
              />
              <div class="suggestions-gap"></div>
              <app-suggestion-list
                [sessionId]="session()!.id"
                [teamId]="session()!.teamId"
                [sessionState]="session()!.state"
                [tiedSuggestionIds]="tiedSuggestionIds()"
              />
            }
          </section>
          <section class="slot" data-testid="votes-slot">
          </section>
          <section class="slot" data-testid="comments-slot">
            <!-- Comments — T-030 -->
          </section>
          <section class="slot" data-testid="presence-slot">
            <app-presence [sessionId]="session()!.id" />
          </section>
        </div>
      } @else if (notFound()) {
        <p data-testid="session-not-found">Session not found.</p>
      } @else {
        <p>Loading…</p>
      }
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; max-width: 800px; margin: 0 auto; }
    .reconnecting-pill {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 12px;
      display: inline-block;
      margin-bottom: 12px;
    }
    .cancelled-banner {
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .content-slots { margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
    .slot { min-height: 4px; }
    .suggestions-gap { height: 16px; }
  `],
})
export class SessionPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly sessionStore = inject(SessionStore);
  readonly hub = inject(SessionHubClient);

  readonly session = signal<SessionDetail | null>(null);
  readonly notFound = signal(false);

  readonly isOrganizer = computed(() => {
    const s = this.session();
    const user = this.sessionStore.user();
    return s !== null && !!user && s.startedBy === user.id;
  });

  readonly isActive = computed(() => {
    const state = this.session()?.state;
    return state === 'Suggesting' || state === 'Voting';
  });

  readonly isCancelled = computed(() => this.session()?.state === 'Cancelled');

  readonly isSuggestingDisabled = computed(() => this.session()?.state !== 'Suggesting');

  readonly isTieBreak = computed(() => this.session()?.tieBreak?.active === true);

  readonly tieBreakDeadline = computed(() => {
    const tb = this.session()?.tieBreak;
    return tb?.active ? tb.deadline : null;
  });

  readonly tiedSuggestionIds = computed(() => this.session()?.tieBreak?.tiedSuggestionIds ?? []);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
    this.loadSession();
    this.hub.connect(sessionId);
    this.hub.on<{ state: string }>('StateChanged', payload => {
      this.session.update(s => s ? { ...s, state: payload.state } : s);
    });
    this.hub.on<{ tiedSuggestionIds: string[]; tieBreakDeadline: string }>('TieBreakStarted', payload => {
      this.session.update(s => s ? {
        ...s,
        tieBreak: { active: true, tiedSuggestionIds: payload.tiedSuggestionIds, deadline: payload.tieBreakDeadline }
      } : s);
    });
    this.hub.on<{ state: string; sessionId: string }>('Decided', payload => {
      this.session.update(s => s ? { ...s, state: payload.state } : s);
      const s = this.session();
      if (s) {
        this.router.navigate(['/teams', s.teamId, 'sessions', s.id, 'winner']);
      }
    });
  }

  ngOnDestroy(): void {
    this.hub.off('StateChanged');
    this.hub.off('TieBreakStarted');
    this.hub.off('Decided');
    this.hub.disconnect();
  }

  sessionTitle(): string {
    const s = this.session();
    if (!s) return '';
    return `Lunch · ${new Date(s.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }

  sessionStatus(): SessionStatus {
    return (this.session()?.state.toLowerCase() ?? 'suggesting') as SessionStatus;
  }

  startVoting(): void {
    const s = this.session();
    if (!s) return;
    this.http
      .post<SessionDetail>(`${environment.apiBaseUrl}/sessions/${s.id}/start-voting`, {})
      .subscribe({ next: updated => this.session.set(updated), error: () => {} });
  }

  cancelSession(): void {
    const s = this.session();
    if (!s) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel session',
        message: 'This will end the session and no winner will be declared. Continue?',
        confirmLabel: 'Cancel session',
        destructive: true,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.http
        .post<SessionDetail>(`${environment.apiBaseUrl}/sessions/${s.id}/cancel`, {})
        .subscribe({ next: updated => this.session.set(updated), error: () => {} });
    });
  }

  private loadSession(): void {
    const teamId = this.route.snapshot.paramMap.get('teamId') ?? '';
    const sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
    this.http
      .get<SessionDetail>(`${environment.apiBaseUrl}/teams/${teamId}/sessions/${sessionId}`)
      .subscribe({
        next: s => this.session.set(s),
        error: err => { if (err.status === 404) this.notFound.set(true); },
      });
  }
}
