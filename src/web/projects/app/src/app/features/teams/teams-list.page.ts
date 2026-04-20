import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface TeamSummary {
  id: string;
  name: string;
  description?: string;
  callerRole: string;
  memberCount: number;
}

@Component({
  selector: 'app-teams-list-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="page-shell">
      <div class="page-header">
        <h1 class="mat-headline-small">Teams</h1>
        <a mat-flat-button routerLink="/teams/new" data-testid="create-team-button">
          <mat-icon>add</mat-icon>
          New team
        </a>
      </div>

      @if (teams().length === 0) {
        <div class="empty-state" data-testid="empty-state">
          <p>You're not a member of any teams yet.</p>
          <a mat-stroked-button routerLink="/teams/new">Create your first team</a>
        </div>
      } @else {
        <ul class="teams-list" data-testid="teams-list">
          @for (team of teams(); track team.id) {
            <li>
              <a [routerLink]="['/teams', team.id]" class="team-item" [attr.data-testid]="'team-' + team.id">
                <span class="team-name">{{ team.name }}</span>
                <span class="team-meta">{{ team.memberCount }} member{{ team.memberCount !== 1 ? 's' : '' }} · {{ team.callerRole }}</span>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; max-width: 640px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    h1 { margin: 0; }
    .empty-state { text-align: center; padding: 48px 0; display: flex; flex-direction: column; gap: 16px; align-items: center; }
    .teams-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .team-item { display: flex; flex-direction: column; padding: 16px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 8px; text-decoration: none; color: inherit; }
    .team-item:hover { background: var(--mat-sys-surface-variant); }
    .team-name { font-weight: 500; }
    .team-meta { font-size: 12px; color: var(--mat-sys-on-surface-variant); margin-top: 4px; }
  `],
})
export class TeamsListPage implements OnInit {
  private readonly http = inject(HttpClient);

  readonly teams = signal<TeamSummary[]>([]);

  ngOnInit(): void {
    this.http.get<TeamSummary[]>(`${environment.apiBaseUrl}/teams`).subscribe({
      next: teams => this.teams.set(teams),
      error: () => {},
    });
  }
}
