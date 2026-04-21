import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

export type HubEventName =
  | 'SuggestionAdded' | 'SuggestionWithdrawn'
  | 'VoteChanged'
  | 'CommentAdded' | 'CommentEdited' | 'CommentDeleted'
  | 'StateChanged' | 'TieBreakStarted' | 'Decided'
  | 'PresenceChanged';

@Injectable({ providedIn: 'root' })
export class SessionHubClient {
  private connection: signalR.HubConnection | null = null;
  readonly isConnected = signal(false);

  connect(sessionId: string): void {
    if (this.connection) {
      this.disconnect();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}?sessionId=${sessionId}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    this.connection.onreconnecting(() => this.isConnected.set(false));
    this.connection.onreconnected(() => this.isConnected.set(true));
    this.connection.onclose(() => this.isConnected.set(false));

    this.connection.start()
      .then(() => this.isConnected.set(true))
      .catch(() => this.isConnected.set(false));
  }

  on<T = unknown>(event: HubEventName, callback: (payload: T) => void): void {
    this.connection?.on(event, callback);
  }

  off(event: HubEventName): void {
    this.connection?.off(event);
  }

  disconnect(): void {
    this.connection?.stop();
    this.connection = null;
    this.isConnected.set(false);
  }
}
