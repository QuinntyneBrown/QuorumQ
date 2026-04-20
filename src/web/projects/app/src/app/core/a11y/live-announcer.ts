import { Injectable, inject } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Injectable({ providedIn: 'root' })
export class QqLiveAnnouncer {
  private readonly cdk = inject(LiveAnnouncer);

  polite(message: string): Promise<void> {
    return this.cdk.announce(message, 'polite');
  }

  assertive(message: string): Promise<void> {
    return this.cdk.announce(message, 'assertive');
  }

  clear(): void {
    this.cdk.clear();
  }
}
