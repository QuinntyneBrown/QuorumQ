import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { WinnerRevealComponent } from '@components';
import { QqLiveAnnouncer } from '../../core/a11y/live-announcer';
import { ReviewFormComponent } from '../reviews/review-form.component';
import { environment } from '../../../environments/environment';

interface SessionWinner {
  id: string;
  state: string;
  winnerName?: string;
  winnerChosenAtRandom?: boolean;
  winnerCuisine?: string;
  winnerWebsiteUrl?: string;
  winnerDirectionsUrl?: string;
  teamId: string;
}

@Component({
  selector: 'app-winner-reveal-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatChipsModule, MatIconModule, WinnerRevealComponent, ReviewFormComponent],
  template: `
    <div
      class="winner-page"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="session()?.winnerName ? 'Winner: ' + session()!.winnerName : 'Winner reveal'"
      data-testid="winner-reveal-page"
    >
      @if (session() && session()!.winnerName) {
        <qq-winner-reveal
          #revealComp
          data-testid="winner-reveal"
        >
          @if (session()!.winnerCuisine) {
            <p class="cuisine" data-testid="winner-cuisine">{{ session()!.winnerCuisine }}</p>
          }
          @if (session()!.winnerChosenAtRandom) {
            <mat-chip-set>
              <mat-chip data-testid="random-choice-chip">Chosen at random</mat-chip>
            </mat-chip-set>
          }
          <div class="actions">
            <a
              mat-flat-button
              color="primary"
              [href]="session()!.winnerDirectionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              [attr.disabled]="session()!.winnerDirectionsUrl ? null : true"
              data-testid="directions-btn"
            >
              <mat-icon>directions</mat-icon>
              Get directions
            </a>
            <a
              mat-stroked-button
              [href]="session()!.winnerWebsiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              [class.disabled]="!session()!.winnerWebsiteUrl"
              [attr.aria-disabled]="!session()!.winnerWebsiteUrl"
              data-testid="website-btn"
            >
              <mat-icon>open_in_new</mat-icon>
              Open website
            </a>
          </div>
          <app-review-form
            [sessionId]="sessionId()"
            data-testid="review-form-wrapper"
          />
          <a
            mat-stroked-button
            [routerLink]="['/teams', session()!.teamId, 'sessions', sessionId()]"
            data-testid="back-to-session-btn"
          >
            Back to session
          </a>
        </qq-winner-reveal>
      } @else if (!session()) {
        <p>Loading…</p>
      }
    </div>
  `,
  styles: [`
    .winner-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      background: var(--mat-sys-surface);
    }
    qq-winner-reveal {
      width: 100%;
      max-width: 480px;
    }
    .cuisine {
      color: var(--mat-sys-on-tertiary-container);
      opacity: 0.8;
      margin: 4px 0 8px;
      font-size: 1rem;
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }
    a.disabled { pointer-events: none; opacity: 0.4; }
  `],
})
export class WinnerRevealPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly announcer = inject(QqLiveAnnouncer);

  @ViewChild('revealComp') revealComp?: WinnerRevealComponent;

  readonly sessionId = signal('');
  readonly teamId = signal('');
  readonly session = signal<SessionWinner | null>(null);

  ngOnInit(): void {
    this.sessionId.set(this.route.snapshot.paramMap.get('sessionId') ?? '');
    this.teamId.set(this.route.snapshot.paramMap.get('teamId') ?? '');
    this.loadSession();
  }

  private loadSession(): void {
    const teamId = this.teamId();
    const sessionId = this.sessionId();
    this.http
      .get<SessionWinner>(`${environment.apiBaseUrl}/teams/${teamId}/sessions/${sessionId}`)
      .subscribe({
        next: s => {
          if (s.state !== 'Decided' || !s.winnerName) {
            this.router.navigate(['/teams', teamId, 'sessions', sessionId]);
            return;
          }
          this.session.set(s);
          this.announcer.assertive(`Winner: ${s.winnerName}`);
          setTimeout(() => {
            if (this.revealComp && s.winnerName) {
              this.revealComp.reveal(s.winnerName);
            }
          }, 100);
        },
        error: () => this.router.navigate(['/teams', teamId, 'sessions', sessionId]),
      });
  }
}
