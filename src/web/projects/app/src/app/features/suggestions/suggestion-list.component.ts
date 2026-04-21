import { Component, inject, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AvatarComponent, CardComponent, ConfirmDialogComponent } from '@components';
import { SessionHubClient } from '../../core/realtime/session-hub.client';
import { SessionStore } from '../../core/auth/session.store';
import { VoteButtonComponent } from '../voting/vote-button.component';
import { environment } from '../../../environments/environment';
import type { SuggestionDto } from './suggest-restaurant.component';

interface VoteTally {
  suggestionId: string;
  count: number;
  youVoted: boolean;
}

@Component({
  selector: 'app-suggestion-list',
  standalone: true,
  imports: [MatChipsModule, MatButtonModule, MatIconModule, AvatarComponent, CardComponent, VoteButtonComponent],
  template: `
    @if (suggestions().length === 0) {
      <p class="empty" data-testid="no-suggestions">No suggestions yet. Be the first!</p>
    } @else {
      <ul class="suggestion-list" data-testid="suggestion-list">
        @for (s of suggestions(); track s.id) {
          <li [attr.data-testid]="'suggestion-' + s.id" class="suggestion-item">
            <qq-card appearance="outlined">
              <div class="card-body">
                <div class="restaurant-header">
                  <span class="restaurant-name" data-testid="restaurant-name">{{ s.restaurantName }}</span>
                  @if (s.cuisine) {
                    <mat-chip-set>
                      <mat-chip>{{ s.cuisine }}</mat-chip>
                    </mat-chip-set>
                  }
                  @if (sessionState === 'Voting') {
                    <app-vote-button
                      class="vote-btn-wrapper"
                      [suggestionId]="s.id"
                      [restaurantName]="s.restaurantName"
                      [voteCount]="s.voteCount"
                      [youVoted]="s.youVoted"
                      [disabled]="tiedSuggestionIds.length > 0 && !tiedSuggestionIds.includes(s.id)"
                      (toggle)="castVote($event)"
                    />
                  }
                  @if (canWithdraw(s)) {
                    <button
                      mat-icon-button
                      class="withdraw-btn"
                      [attr.data-testid]="'withdraw-btn-' + s.id"
                      aria-label="Withdraw suggestion"
                      (click)="confirmWithdraw(s)"
                    >
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  }
                </div>
                @if (s.address) {
                  <p class="address">{{ s.address }}</p>
                }
                @if (s.websiteUrl) {
                  <a [href]="s.websiteUrl" target="_blank" rel="noopener" class="website">
                    {{ s.websiteUrl }}
                  </a>
                }
                <div class="meta">
                  <qq-avatar [name]="s.suggestedByName" size="sm" />
                  <span class="by-name">{{ s.suggestedByName }}</span>
                  <span class="vote-count" [attr.data-testid]="'vote-count-' + s.id">
                    {{ s.voteCount }} vote{{ s.voteCount === 1 ? '' : 's' }}
                  </span>
                </div>
              </div>
            </qq-card>
          </li>
        }
      </ul>
    }
  `,
  styles: [`
    .empty { color: var(--mat-sys-on-surface-variant); font-size: 14px; }
    .suggestion-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .suggestion-item { display: block; }
    .card-body { padding: 12px 16px; }
    .restaurant-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
    .restaurant-name { font-weight: 600; font-size: 16px; }
    .vote-btn-wrapper { margin-left: auto; }
    .withdraw-btn { color: var(--mat-sys-error); }
    .address { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin: 4px 0; }
    .website { font-size: 13px; color: var(--mat-sys-primary); display: block; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .vote-count { margin-left: auto; }
  `],
})
export class SuggestionListComponent implements OnInit, OnDestroy {
  @Input({ required: true }) sessionId!: string;
  @Input() sessionState = '';
  @Input() tiedSuggestionIds: string[] = [];

  private readonly http = inject(HttpClient);
  private readonly hub = inject(SessionHubClient);
  private readonly dialog = inject(MatDialog);
  private readonly sessionStore = inject(SessionStore);

  readonly suggestions = signal<SuggestionDto[]>([]);

  canWithdraw(s: SuggestionDto): boolean {
    const userId = this.sessionStore.user()?.id;
    return this.sessionState === 'Suggesting' && !!userId && s.suggestedBy === userId;
  }

  confirmWithdraw(s: SuggestionDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Withdraw suggestion',
        message: `Remove "${s.restaurantName}" from this session?`,
        confirmLabel: 'Withdraw',
        destructive: true,
      },
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.http
        .delete(`${environment.apiBaseUrl}/sessions/${this.sessionId}/suggestions/${s.id}`)
        .subscribe({
          next: () => this.suggestions.update(list => list.filter(x => x.id !== s.id)),
          error: () => {},
        });
    });
  }

  castVote(suggestionId: string): void {
    this.http
      .put<{ tallies: VoteTally[] }>(`${environment.apiBaseUrl}/sessions/${this.sessionId}/votes`, { suggestionId })
      .subscribe({
        next: res => this.applyTallies(res.tallies),
        error: () => {},
      });
  }

  private applyTallies(tallies: VoteTally[]): void {
    this.suggestions.update(list =>
      list.map(s => {
        const t = tallies.find(x => x.suggestionId === s.id);
        return t ? { ...s, voteCount: t.count, youVoted: t.youVoted } : s;
      })
    );
  }

  ngOnInit(): void {
    this.loadSuggestions();
    this.hub.on<SuggestionDto>('SuggestionAdded', dto => {
      this.suggestions.update(list => [...list, dto]);
    });
    this.hub.on<{ id: string }>('SuggestionWithdrawn', payload => {
      this.suggestions.update(list => list.filter(s => s.id !== payload.id));
    });
    this.hub.on<{ tallies: VoteTally[] }>('VoteChanged', payload => {
      this.applyTallies(payload.tallies);
    });
  }

  loadSuggestions(): void {
    this.http
      .get<SuggestionDto[]>(`${environment.apiBaseUrl}/sessions/${this.sessionId}/suggestions`)
      .subscribe({ next: list => this.suggestions.set(list), error: () => {} });
  }

  ngOnDestroy(): void {
    this.hub.off('SuggestionAdded');
    this.hub.off('SuggestionWithdrawn');
    this.hub.off('VoteChanged');
  }
}
