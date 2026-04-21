import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AvatarComponent, CardComponent } from '@components';
import { environment } from '../../../environments/environment';

interface CommentAuthor {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

interface CommentDto {
  id: string;
  suggestionId: string;
  body: string;
  author: CommentAuthor;
  createdAt: string;
  editedAt?: string;
  deleted: boolean;
}

interface SuggestionDetail {
  id: string;
  restaurantId: string;
  name: string;
  cuisine?: string;
  voteCount: number;
  isWinner: boolean;
}

interface SessionDetail {
  id: string;
  teamId: string;
  state: string;
  startedAt: string;
  decidedAt?: string;
  winner?: string;
  suggestions: SuggestionDetail[];
  comments: CommentDto[];
}

@Component({
  selector: 'app-session-history-detail-page',
  standalone: true,
  imports: [RouterLink, DatePipe, MatButtonModule, MatIconModule, MatChipsModule, AvatarComponent, CardComponent],
  template: `
    <div class="detail-shell" data-testid="session-history-detail" [attr.aria-label]="session() ? 'Read-only session from ' + (session()!.startedAt | date:'mediumDate') : 'Loading'">
      @if (session()) {
        <header class="detail-header">
          <div class="header-row">
            <h1 class="detail-title">
              Lunch · {{ session()!.startedAt | date:'mediumDate' }}
            </h1>
            <span class="read-only-badge" data-testid="read-only-badge" aria-live="polite">Read-only</span>
          </div>
          @if (session()!.winner) {
            <p class="winner-line" data-testid="detail-winner">
              <mat-icon>emoji_events</mat-icon>
              {{ session()!.winner }}
            </p>
          }
          <a mat-stroked-button [routerLink]="['/teams', session()!.teamId, 'history']" data-testid="back-to-history-btn">
            Back to history
          </a>
        </header>

        <section class="suggestions-section">
          <h2>Suggestions</h2>
          <ul class="suggestions-list" data-testid="suggestions-list">
            @for (s of session()!.suggestions; track s.id) {
              <li [attr.data-testid]="'suggestion-' + s.id">
                <qq-card appearance="outlined">
                  <div class="suggestion-body">
                    <div class="suggestion-row">
                      <span class="suggestion-name" [attr.data-testid]="'suggestion-name-' + s.id">{{ s.name }}</span>
                      @if (s.cuisine) {
                        <span class="suggestion-cuisine">{{ s.cuisine }}</span>
                      }
                      @if (s.isWinner) {
                        <mat-chip data-testid="winner-chip">Winner</mat-chip>
                      }
                      <span class="vote-count" [attr.data-testid]="'vote-count-' + s.id">
                        {{ s.voteCount }} vote{{ s.voteCount === 1 ? '' : 's' }}
                      </span>
                    </div>
                    @if (commentsFor(s.id).length) {
                      <ul class="comments-list">
                        @for (c of commentsFor(s.id); track c.id) {
                          <li class="comment-item" [attr.data-testid]="'comment-' + c.id">
                            @if (c.deleted) {
                              <span class="comment-deleted">Comment deleted</span>
                            } @else {
                              <qq-avatar [name]="c.author.displayName" size="sm" />
                              <span class="comment-author">{{ c.author.displayName }}</span>
                              <span class="comment-body">{{ c.body }}</span>
                            }
                          </li>
                        }
                      </ul>
                    }
                  </div>
                </qq-card>
              </li>
            }
          </ul>
        </section>
      } @else if (notFound()) {
        <p data-testid="not-found">Session not found.</p>
      } @else {
        <p>Loading…</p>
      }
    </div>
  `,
  styles: [`
    .detail-shell { padding: 24px; max-width: 800px; margin: 0 auto; }
    .detail-header { margin-bottom: 24px; }
    .header-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .detail-title { font-size: 22px; font-weight: 700; margin: 0; }
    .read-only-badge {
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 12px; background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container); text-transform: uppercase; letter-spacing: .5px;
    }
    .winner-line { display: flex; align-items: center; gap: 6px; font-weight: 500; margin: 0 0 12px; }
    .suggestions-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .suggestion-body { padding: 12px 16px; }
    .suggestion-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .suggestion-name { font-weight: 600; font-size: 15px; }
    .suggestion-cuisine { font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .vote-count { margin-left: auto; font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .comments-list { list-style: none; padding: 8px 0 0 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
    .comment-item { display: flex; align-items: baseline; gap: 6px; font-size: 13px; }
    .comment-author { font-weight: 500; }
    .comment-body { color: var(--mat-sys-on-surface-variant); }
    .comment-deleted { font-style: italic; color: var(--mat-sys-on-surface-variant); }
    h2 { font-size: 17px; font-weight: 600; margin: 0 0 12px; }
  `],
})
export class SessionHistoryDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  readonly session = signal<SessionDetail | null>(null);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
    this.http
      .get<SessionDetail>(`${environment.apiBaseUrl}/sessions/${sessionId}/detail`)
      .subscribe({
        next: s => this.session.set(s),
        error: err => { if (err.status === 404) this.notFound.set(true); },
      });
  }

  commentsFor(suggestionId: string): CommentDto[] {
    return (this.session()?.comments ?? []).filter(c => c.suggestionId === suggestionId);
  }
}
