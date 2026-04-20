import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { SessionCardComponent, CountdownComponent, SessionStatus } from '@components';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../../core/auth/session.store';

interface TeamDetail {
  id: string;
  name: string;
  description?: string;
  callerRole: string;
  memberCount: number;
}

interface SessionSummary {
  id: string;
  state: string;
  deadline: string;
  startedAt: string;
  suggestionCount: number;
  winnerName?: string;
}

interface DashboardData {
  team: TeamDetail;
  activeSession?: SessionSummary;
  recentSessions: SessionSummary[];
}

@Component({
  selector: 'app-team-dashboard-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, SessionCardComponent, CountdownComponent],
  template: `
    <div class="page-shell">
      @if (dashboard()) {
        <div class="page-header">
          <h1 class="mat-headline-small" data-testid="team-name">{{ dashboard()!.team.name }}</h1>
          <span class="role-badge" data-testid="caller-role">{{ dashboard()!.team.callerRole }}</span>
        </div>
        @if (dashboard()!.team.description) {
          <p class="description">{{ dashboard()!.team.description }}</p>
        }
        <p class="meta" data-testid="member-count">
          {{ dashboard()!.team.memberCount }} member{{ dashboard()!.team.memberCount !== 1 ? 's' : '' }}
        </p>

        @if (dashboard()!.activeSession) {
          <qq-session-card
            class="active-card"
            data-testid="active-session-card"
            [title]="sessionTitle(dashboard()!.activeSession!)"
            [status]="sessionStatus(dashboard()!.activeSession!)"
          >
            <qq-countdown
              slot="countdown"
              [deadline]="dashboard()!.activeSession!.deadline"
            />
            <div slot="actions">
              <a
                mat-flat-button
                [routerLink]="['/teams', teamId(), 'sessions', dashboard()!.activeSession!.id]"
                data-testid="view-session-btn"
              >
                View session
              </a>
            </div>
          </qq-session-card>
        } @else {
          <div class="start-cta">
            <a
              mat-flat-button
              color="primary"
              [routerLink]="['/teams', teamId(), 'sessions', 'new']"
              data-testid="start-lunch-btn"
            >
              <mat-icon>restaurant</mat-icon>
              Start lunch
            </a>
          </div>
        }

        @if (dashboard()!.recentSessions.length > 0) {
          <section class="recent-section" data-testid="recent-sessions">
            <h2 class="mat-title-medium">Recent sessions</h2>
            <ul class="recent-list">
              @for (session of dashboard()!.recentSessions; track session.id) {
                <li>
                  <a
                    class="recent-item"
                    [routerLink]="['/teams', teamId(), 'sessions', session.id]"
                    [attr.data-testid]="'recent-session-' + session.id"
                  >
                    <span class="recent-title">{{ sessionTitle(session) }}</span>
                    @if (session.winnerName) {
                      <span class="recent-winner">🏆 {{ session.winnerName }}</span>
                    }
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      } @else {
        <p>Loading…</p>
      }
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; max-width: 800px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
    h1 { margin: 0; }
    .role-badge { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-radius: 12px; padding: 2px 10px; font-size: 12px; }
    .description { color: var(--mat-sys-on-surface-variant); margin-bottom: 8px; }
    .meta { font-size: 14px; color: var(--mat-sys-on-surface-variant); margin-bottom: 24px; }
    .active-card { display: block; width: 100%; margin-bottom: 24px; }
    .start-cta { margin-bottom: 24px; }
    .recent-section { margin-top: 8px; }
    h2 { margin: 0 0 12px; }
    .recent-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .recent-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 8px; text-decoration: none; color: inherit; }
    .recent-item:hover { background: var(--mat-sys-surface-variant); }
    .recent-title { font-size: 14px; }
    .recent-winner { font-size: 12px; color: var(--mat-sys-on-surface-variant); }

    @media (max-width: 599px) {
      .active-card { margin-left: -24px; margin-right: -24px; width: calc(100% + 48px); border-radius: 0; }
    }
  `],
})
export class TeamDashboardPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStore);

  readonly dashboard = signal<DashboardData | null>(null);
  readonly teamId = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('teamId') ?? '';
    this.teamId.set(id);
    this.session.lastTeamId.set(id);

    this.http.get<DashboardData>(`${environment.apiBaseUrl}/teams/${id}/dashboard`).subscribe({
      next: d => this.dashboard.set(d),
      error: () => {},
    });
  }

  sessionTitle(session: SessionSummary): string {
    return `Lunch · ${new Date(session.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }

  sessionStatus(session: SessionSummary): SessionStatus {
    return session.state.toLowerCase() as SessionStatus;
  }
}
