import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { SessionCardComponent, CountdownComponent, SessionStatus } from '@components';
import { environment } from '../../../environments/environment';

interface SessionDetail {
  id: string;
  teamId: string;
  state: string;
  deadline: string;
  startedAt: string;
  suggestionCount: number;
  winnerName?: string;
}

@Component({
  selector: 'app-session-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, SessionCardComponent, CountdownComponent],
  template: `
    <div class="page-shell">
      @if (session()) {
        <qq-session-card
          data-testid="session-card"
          [title]="sessionTitle()"
          [status]="sessionStatus()"
        >
          <qq-countdown
            slot="countdown"
            [deadline]="session()!.deadline"
          />
          <div slot="actions">
            <a
              mat-stroked-button
              [routerLink]="['/teams', session()!.teamId]"
              data-testid="back-to-team-btn"
            >
              Back to team
            </a>
          </div>
        </qq-session-card>

        <div class="content-slots">
          <section class="slot" data-testid="suggestions-slot">
            <!-- Suggestions — T-024 -->
          </section>
          <section class="slot" data-testid="votes-slot">
            <!-- Votes — T-027 -->
          </section>
          <section class="slot" data-testid="comments-slot">
            <!-- Comments — T-030 -->
          </section>
          <section class="slot" data-testid="presence-slot">
            <!-- Presence — T-023 -->
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
    .content-slots { margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
    .slot { min-height: 4px; }
  `],
})
export class SessionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  readonly session = signal<SessionDetail | null>(null);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const teamId = this.route.snapshot.paramMap.get('teamId') ?? '';
    const sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';

    this.http
      .get<SessionDetail>(`${environment.apiBaseUrl}/teams/${teamId}/sessions/${sessionId}`)
      .subscribe({
        next: s => this.session.set(s),
        error: err => { if (err.status === 404) this.notFound.set(true); },
      });
  }

  sessionTitle(): string {
    const s = this.session();
    if (!s) return '';
    return `Lunch · ${new Date(s.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }

  sessionStatus(): SessionStatus {
    return (this.session()?.state.toLowerCase() ?? 'suggesting') as SessionStatus;
  }
}
