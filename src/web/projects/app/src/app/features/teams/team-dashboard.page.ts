import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface TeamDetail {
  id: string;
  name: string;
  description?: string;
  callerRole: string;
  memberCount: number;
}

@Component({
  selector: 'app-team-dashboard-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="page-shell">
      @if (team()) {
        <div class="page-header">
          <h1 class="mat-headline-small" data-testid="team-name">{{ team()!.name }}</h1>
          <span class="role-badge" data-testid="caller-role">{{ team()!.callerRole }}</span>
        </div>
        @if (team()!.description) {
          <p class="description">{{ team()!.description }}</p>
        }
        <p class="meta" data-testid="member-count">{{ team()!.memberCount }} member{{ team()!.memberCount !== 1 ? 's' : '' }}</p>
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
    .meta { font-size: 14px; color: var(--mat-sys-on-surface-variant); }
  `],
})
export class TeamDashboardPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  readonly team = signal<TeamDetail | null>(null);

  ngOnInit(): void {
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (!teamId) return;

    this.http.get<TeamDetail>(`${environment.apiBaseUrl}/teams/${teamId}`).subscribe({
      next: t => this.team.set(t),
      error: () => {},
    });
  }
}
