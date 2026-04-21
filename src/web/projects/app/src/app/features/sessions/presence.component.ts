import { Component, inject, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AvatarComponent, PresenceIndicatorComponent } from '@components';
import { SessionHubClient } from '../../core/realtime/session-hub.client';
import { environment } from '../../../environments/environment';

interface PresenceUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

const MAX_VISIBLE = 5;

@Component({
  selector: 'app-presence',
  standalone: true,
  imports: [MatBadgeModule, MatTooltipModule, AvatarComponent, PresenceIndicatorComponent],
  template: `
    @if (presentUsers().length > 0) {
      <div class="presence-row" data-testid="presence-row">
        @for (user of visibleUsers(); track user.id) {
          <div
            class="presence-item"
            [attr.data-testid]="'presence-user-' + user.id"
            [matTooltip]="user.displayName"
            tabindex="0"
            [attr.aria-label]="user.displayName + ' is online'"
          >
            <qq-avatar [name]="user.displayName" [src]="user.avatarUrl" size="sm" />
            <qq-presence-indicator [online]="true" />
          </div>
        }
        @if (overflow() > 0) {
          <div
            class="presence-overflow"
            data-testid="presence-overflow"
            [matTooltip]="'+' + overflow() + ' more'"
            tabindex="0"
            [attr.aria-label]="overflow() + ' more members online'"
          >
            +{{ overflow() }}
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .presence-row { display: flex; align-items: center; gap: 4px; }
    .presence-item { position: relative; cursor: default; }
    qq-presence-indicator { position: absolute; bottom: 0; right: 0; }
    .presence-overflow {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--mat-sys-surface-variant);
      color: var(--mat-sys-on-surface-variant);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      cursor: default;
    }
  `],
})
export class PresenceComponent implements OnInit, OnDestroy {
  @Input({ required: true }) sessionId!: string;

  private readonly http = inject(HttpClient);
  private readonly hub = inject(SessionHubClient);

  readonly presentUsers = signal<PresenceUser[]>([]);

  readonly visibleUsers = () => this.presentUsers().slice(0, MAX_VISIBLE);
  readonly overflow = () => Math.max(0, this.presentUsers().length - MAX_VISIBLE);

  ngOnInit(): void {
    this.loadPresence();
    this.hub.on<{ presentUserIds: string[] }>('PresenceChanged', () => {
      this.loadPresence();
    });
  }

  private loadPresence(): void {
    this.http
      .get<PresenceUser[]>(`${environment.apiBaseUrl}/sessions/${this.sessionId}/presence`)
      .subscribe({ next: users => this.presentUsers.set(users), error: () => {} });
  }

  ngOnDestroy(): void {
    this.hub.off('PresenceChanged');
  }
}
