import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TeamNotificationHubClient } from '../../core/realtime/team-notification-hub.client';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class SessionNotificationListener {
  private readonly hub = inject(TeamNotificationHubClient);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  start(teamId: string): void {
    this.hub.connect(teamId);
    this.hub.onSessionEvent('session-listener', payload => {
      this.zone.run(() => {
      const currentUrl = this.router.url;
      const isOnSession = currentUrl.includes(`/sessions/${payload.sessionId}`);

      if (isOnSession) return;

      switch (payload.kind) {
        case 'sessionStarted':
          this.notif.show({
            kind: 'info',
            message: 'Lunch started',
            action: 'VIEW',
            deepLink: `/teams/${payload.teamId}/sessions/${payload.sessionId}`,
          });
          break;
        case 'votingStarted':
          this.notif.show({
            kind: 'info',
            message: 'Voting started',
            action: 'VIEW',
            deepLink: `/teams/${payload.teamId}/sessions/${payload.sessionId}`,
          });
          break;
        case 'decided':
          this.notif.show({
            kind: 'success',
            message: payload.winnerName ? `Winner: ${payload.winnerName}` : 'Session decided',
            action: 'VIEW',
            deepLink: `/teams/${payload.teamId}/sessions/${payload.sessionId}/winner`,
          });
          break;
      }
      });
    });
  }

  stop(): void {
    this.hub.offSessionEvent('session-listener');
    this.hub.disconnect();
  }
}
