import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CardComponent, EmptyStateComponent } from '@components';
import { environment } from '../../../environments/environment';

interface TallyEntry {
  restaurantId: string;
  name: string;
  votes: number;
}

interface HistoryItem {
  sessionId: string;
  date: string;
  winner?: string;
  tally: TallyEntry[];
  participantCount: number;
}

interface PagedHistory {
  items: HistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-session-history-page',
  standalone: true,
  imports: [RouterLink, DatePipe, MatButtonModule, MatPaginatorModule, CardComponent, EmptyStateComponent],
  template: `
    <div class="history-shell" data-testid="session-history">
      <header class="history-header">
        <h1>Session History</h1>
      </header>

      @if (history()?.items?.length) {
        <ul class="history-list" data-testid="history-list">
          @for (item of history()!.items; track item.sessionId) {
            <li class="history-item">
              <qq-card
                appearance="outlined"
                [attr.data-testid]="'history-item-' + item.sessionId"
                (click)="openSession(item.sessionId)"
                class="clickable-card"
                role="button"
                tabindex="0"
                (keydown.enter)="openSession(item.sessionId)"
              >
                <div class="item-body">
                  <div class="item-header">
                    <span class="item-date" [attr.data-testid]="'session-date-' + item.sessionId">
                      {{ item.date | date:'mediumDate' }}
                    </span>
                    @if (item.winner) {
                      <span class="item-winner" [attr.data-testid]="'session-winner-' + item.sessionId">
                        {{ item.winner }}
                      </span>
                    } @else {
                      <span class="item-no-winner" [attr.data-testid]="'session-no-winner-' + item.sessionId">
                        No winner
                      </span>
                    }
                    <span class="item-participants">
                      {{ item.participantCount }} participant{{ item.participantCount === 1 ? '' : 's' }}
                    </span>
                  </div>
                  @if (item.tally.length) {
                    <ul class="tally-list" [attr.data-testid]="'tally-' + item.sessionId">
                      @for (t of item.tally; track t.restaurantId) {
                        <li class="tally-entry">
                          <span class="tally-name">{{ t.name }}</span>
                          <span class="tally-votes">{{ t.votes }} vote{{ t.votes === 1 ? '' : 's' }}</span>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </qq-card>
            </li>
          }
        </ul>

        <mat-paginator
          data-testid="history-paginator"
          [length]="history()!.totalCount"
          [pageSize]="pageSize"
          [pageIndex]="page - 1"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)"
        />
      } @else if (loaded()) {
        <qq-empty-state
          title="No past sessions"
          description="Start your first lunch session with your team!"
          data-testid="history-empty-state"
        >
          <a slot="cta" mat-flat-button color="primary"
            [routerLink]="['/teams', teamId()]"
            data-testid="go-to-team-cta">
            Go to team
          </a>
        </qq-empty-state>
      } @else {
        <p>Loading…</p>
      }
    </div>
  `,
  styles: [`
    .history-shell { padding: 24px; max-width: 800px; margin: 0 auto; }
    .history-header { margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0; }
    .history-list { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 12px; }
    .clickable-card { cursor: pointer; display: block; width: 100%; transition: box-shadow 0.15s; }
    .clickable-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.12); }
    .item-body { padding: 16px; }
    .item-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
    .item-date { font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .item-winner { font-weight: 600; font-size: 16px; }
    .item-no-winner { font-size: 14px; color: var(--mat-sys-on-surface-variant); font-style: italic; }
    .item-participants { margin-left: auto; font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .tally-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }
    .tally-entry { display: flex; justify-content: space-between; font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .tally-votes { font-variant-numeric: tabular-nums; }
  `],
})
export class SessionHistoryPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly teamId = signal('');
  readonly history = signal<PagedHistory | null>(null);
  readonly loaded = signal(false);
  page = 1;
  pageSize = 20;

  ngOnInit(): void {
    this.teamId.set(this.route.snapshot.paramMap.get('teamId') ?? '');
    this.load();
  }

  openSession(sessionId: string): void {
    this.router.navigate(['/teams', this.teamId(), 'history', sessionId]);
  }

  onPageChange(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }

  private load(): void {
    const params = new HttpParams()
      .set('page', this.page)
      .set('pageSize', this.pageSize);

    this.http
      .get<PagedHistory>(`${environment.apiBaseUrl}/teams/${this.teamId()}/history`, { params })
      .subscribe({
        next: h => { this.history.set(h); this.loaded.set(true); },
        error: () => this.loaded.set(true),
      });
  }
}
