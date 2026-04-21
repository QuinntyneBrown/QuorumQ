import { Component } from '@angular/core';

@Component({
  selector: 'app-notifications-stub-page',
  standalone: true,
  template: `
    <div class="tab-content" data-testid="notifications-tab">
      <h2 class="mat-title-medium">Notifications</h2>
      <p class="mat-body-small hint">Notification preferences coming soon (T-036).</p>
    </div>
  `,
  styles: [`.tab-content { padding: 24px 0; } h2 { margin: 0 0 12px; } .hint { color: var(--mat-sys-on-surface-variant); }`],
})
export class NotificationsStubPage {}
