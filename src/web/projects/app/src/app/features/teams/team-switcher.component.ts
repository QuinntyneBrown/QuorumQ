import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { SessionStore } from '../../core/auth/session.store';
import { environment } from '../../../environments/environment';

export interface TeamSummary {
  id: string;
  name: string;
  callerRole: string;
  memberCount: number;
  unreadCount: number;
}

@Component({
  selector: 'app-team-switcher',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule],
  template: `
    <button
      mat-button
      class="team-chip"
      data-testid="team-switcher-trigger"
      [matMenuTriggerFor]="teamMenu"
      aria-haspopup="menu"
      aria-label="Switch team"
    >
      <mat-icon>group</mat-icon>
      <span class="team-chip__name">{{ currentTeamName() }}</span>
      <mat-icon class="team-chip__arrow">expand_more</mat-icon>
    </button>

    <mat-menu #teamMenu="matMenu">
      @for (team of teams(); track team.id) {
        <button
          mat-menu-item
          [class.qq-team-active]="team.id === activeTeamId()"
          (click)="switchTo(team)"
          [attr.data-testid]="'team-item-' + team.id"
        >
          <mat-icon>{{ team.id === activeTeamId() ? 'check' : 'group' }}</mat-icon>
          <span>{{ team.name }}</span>
        </button>
      }
      <mat-divider />
      <button mat-menu-item routerLink="/teams/new" data-testid="create-team-menu-item">
        <mat-icon>add</mat-icon>
        <span>Create new team</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .team-chip { gap: 4px; }
    .team-chip__name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .team-chip__arrow { font-size: 18px; width: 18px; height: 18px; }
    .qq-team-active { background: var(--mat-sys-secondary-container); }
  `],
})
export class TeamSwitcherComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);

  readonly teams = signal<TeamSummary[]>([]);
  readonly activeTeamId = this.session.lastTeamId;

  readonly currentTeamName = computed(() => {
    const id = this.activeTeamId();
    return this.teams().find(t => t.id === id)?.name ?? 'Teams';
  });

  ngOnInit(): void {
    this.http.get<TeamSummary[]>(`${environment.apiBaseUrl}/teams`).subscribe({
      next: teams => this.teams.set(teams),
      error: () => {},
    });
  }

  switchTo(team: TeamSummary): void {
    this.session.lastTeamId.set(team.id);
    this.router.navigate(['/teams', team.id]);
  }
}
