import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SessionStore } from '../../core/auth/session.store';
import { environment } from '../../../environments/environment';
import { TeamSummary } from './team-switcher.component';

@Component({
  selector: 'app-teams-list-page',
  standalone: true,
  imports: [],
  template: `<span></span>`,
})
export class TeamsListPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);

  ngOnInit(): void {
    this.http.get<TeamSummary[]>(`${environment.apiBaseUrl}/teams`).subscribe({
      next: teams => {
        if (teams.length === 0) {
          this.router.navigate(['/teams/no-teams'], { replaceUrl: true });
          return;
        }
        const lastId = this.session.lastTeamId();
        const target = lastId && teams.find(t => t.id === lastId)
          ? lastId
          : teams[0].id;
        this.session.lastTeamId.set(target);
        this.router.navigate(['/teams', target], { replaceUrl: true });
      },
      error: () => {
        this.router.navigate(['/teams/no-teams'], { replaceUrl: true });
      },
    });
  }
}
