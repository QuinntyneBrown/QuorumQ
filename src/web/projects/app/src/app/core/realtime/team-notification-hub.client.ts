import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

export interface SessionEventPayload {
  kind: 'sessionStarted' | 'votingStarted' | 'fiveMinutes' | 'decided';
  sessionId: string;
  teamId: string;
  winnerName?: string;
}

@Injectable({ providedIn: 'root' })
export class TeamNotificationHubClient {
  private connection: signalR.HubConnection | null = null;
  readonly isConnected = signal(false);
  private handlers = new Map<string, (payload: SessionEventPayload) => void>();
  private connectedTeamId: string | null = null;

  connect(teamId: string): void {
    if (this.connectedTeamId === teamId && this.connection) return;
    this.disconnect();

    this.connectedTeamId = teamId;
    const notificationsHubUrl = `${environment.apiBaseUrl}/hubs/notifications`;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${notificationsHubUrl}?teamId=${teamId}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.onreconnecting(() => this.isConnected.set(false));
    this.connection.onreconnected(() => this.isConnected.set(true));
    this.connection.onclose(() => this.isConnected.set(false));

    this.connection.on('SessionEvent', (payload: SessionEventPayload) => {
      this.handlers.forEach(h => h(payload));
    });

    this.connection.start()
      .then(() => this.isConnected.set(true))
      .catch(() => this.isConnected.set(false));
  }

  onSessionEvent(key: string, handler: (payload: SessionEventPayload) => void): void {
    this.handlers.set(key, handler);
  }

  offSessionEvent(key: string): void {
    this.handlers.delete(key);
  }

  disconnect(): void {
    this.connection?.stop();
    this.connection = null;
    this.isConnected.set(false);
    this.connectedTeamId = null;
  }
}
