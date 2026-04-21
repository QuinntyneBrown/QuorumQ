import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../notifications/notification.service';
import { QqLiveAnnouncer } from '../../core/a11y/live-announcer';

interface TeamPreference {
  teamId: string;
  teamName: string;
  muted: boolean;
}

@Component({
  selector: 'app-notification-settings-page',
  standalone: true,
  imports: [MatSlideToggleModule, MatListModule],
  template: `
    <div class="tab-content" data-testid="notifications-tab">
      <h2 class="mat-title-medium">Notifications</h2>
      <p class="hint mat-body-small">Muted teams will not send any notifications.</p>

      @if (prefs().length === 0) {
        <p class="empty mat-body-medium" data-testid="no-teams">No teams yet.</p>
      }

      <mat-list>
        @for (pref of prefs(); track pref.teamId) {
          <mat-list-item>
            <span matListItemTitle [attr.data-testid]="'team-name-' + pref.teamId">
              {{ pref.teamName }}
            </span>
            <mat-slide-toggle
              matListItemMeta
              [checked]="pref.muted"
              [attr.aria-label]="'Mute notifications for ' + pref.teamName"
              [attr.data-testid]="'mute-toggle-' + pref.teamId"
              (change)="toggleMute(pref, $event.checked)"
            >
              Mute
            </mat-slide-toggle>
          </mat-list-item>
        }
      </mat-list>
    </div>
  `,
  styles: [`
    .tab-content { padding: 24px 0; }
    h2 { margin: 0 0 8px; }
    .hint { color: var(--mat-sys-on-surface-variant); margin: 0 0 16px; }
    .empty { color: var(--mat-sys-on-surface-variant); }
  `],
})
export class NotificationSettingsPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly notif = inject(NotificationService);
  private readonly announcer = inject(QqLiveAnnouncer);

  readonly prefs = signal<TeamPreference[]>([]);

  ngOnInit(): void {
    this.http
      .get<TeamPreference[]>(`${environment.apiBaseUrl}/notification-preferences`)
      .subscribe({ next: p => this.prefs.set(p), error: () => {} });
  }

  toggleMute(pref: TeamPreference, muted: boolean): void {
    this.http
      .put(`${environment.apiBaseUrl}/notification-preferences/${pref.teamId}`, { muted })
      .subscribe({
        next: () => {
          this.prefs.update(list =>
            list.map(p => p.teamId === pref.teamId ? { ...p, muted } : p),
          );
          const msg = muted
            ? `Notifications muted for ${pref.teamName}`
            : `Notifications enabled for ${pref.teamName}`;
          this.announcer.polite(msg);
        },
        error: () => {},
      });
  }
}
