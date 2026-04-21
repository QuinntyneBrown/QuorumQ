import { Component, inject, OnInit, AfterViewInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';
import { WinnerRevealComponent } from '@components';
import { environment } from '../../../environments/environment';

interface WinnerSessionDetail {
  id: string;
  teamId: string;
  state: string;
  winnerName?: string;
  winnerCuisine?: string;
  winnerChosenAtRandom?: boolean;
  directionsUrl?: string;
  websiteUrl?: string;
}

@Component({
  selector: 'app-winner-reveal-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, WinnerRevealComponent],
  template: `
    <div class="winner-overlay" role="dialog" aria-modal="true" data-testid="winner-reveal-page">
      <qq-winner-reveal #revealRef>
        @if (session(); as s) {
          @if (s.winnerCuisine) {
            <p class="cuisine" data-testid="winner-cuisine">{{ s.winnerCuisine }}</p>
          }
          @if (s.winnerChosenAtRandom) {
            <span class="random-chip" data-testid="random-choice-chip">Chosen at random</span>
          }
          <div class="actions">
            @if (s.directionsUrl) {
              <a
                mat-flat-button
                color="primary"
                [href]="s.directionsUrl"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="directions-link"
              >
                Get directions
              </a>
            }
            @if (s.websiteUrl) {
              <a
                mat-stroked-button
                [href]="s.websiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="website-link"
              >
                Open website
              </a>
            }
            <a
              mat-stroked-button
              [routerLink]="['/teams', s.teamId, 'sessions', s.id]"
              data-testid="back-to-session-btn"
            >
              Back to session
            </a>
          </div>
        }
      </qq-winner-reveal>
    </div>
  `,
  styles: [`
    .winner-overlay {
      position: fixed;
      inset: 0;
      background: var(--mat-sys-background);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 24px;
    }
    qq-winner-reveal {
      width: 100%;
      max-width: 480px;
    }
    .cuisine {
      color: var(--mat-sys-on-surface-variant);
      font-size: 1rem;
      margin: 8px 0 0;
    }
    .random-chip {
      display: inline-block;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      border-radius: 16px;
      padding: 2px 10px;
      font-size: 12px;
      margin-top: 8px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 20px;
      width: 100%;
    }
  `],
})
export class WinnerRevealPage implements OnInit, AfterViewInit {
  @ViewChild('revealRef') revealRef!: WinnerRevealComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly announcer = inject(LiveAnnouncer);

  readonly session = signal<WinnerSessionDetail | null>(null);
  private revealed = false;

  ngOnInit(): void {
    this.loadSession();
  }

  ngAfterViewInit(): void {
    const s = this.session();
    if (s?.winnerName) {
      this.triggerReveal(s.winnerName);
    }
  }

  private triggerReveal(name: string): void {
    if (this.revealed || !this.revealRef) return;
    this.revealed = true;
    this.revealRef.reveal(name);
    this.announcer.announce(`Winner: ${name}`, 'assertive');
  }

  private loadSession(): void {
    const teamId = this.route.snapshot.paramMap.get('teamId') ?? '';
    const sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
    this.http
      .get<WinnerSessionDetail>(`${environment.apiBaseUrl}/teams/${teamId}/sessions/${sessionId}`)
      .subscribe({
        next: s => {
          this.session.set(s);
          if (s.winnerName) {
            this.triggerReveal(s.winnerName);
          }
        },
      });
  }
}
