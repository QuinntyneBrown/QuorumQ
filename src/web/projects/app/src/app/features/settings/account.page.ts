import { Component, inject } from '@angular/core';
import { SessionStore } from '../../core/auth/session.store';

@Component({
  selector: 'app-account-page',
  standalone: true,
  template: `
    <div class="tab-content" data-testid="account-tab">
      <h2 class="mat-title-medium">Account</h2>
      @if (session.user(); as user) {
        <p class="mat-body-medium">{{ user.email }}</p>
        <p class="mat-body-medium">{{ user.displayName }}</p>
      }
    </div>
  `,
  styles: [`.tab-content { padding: 24px 0; } h2 { margin: 0 0 12px; }`],
})
export class AccountPage {
  readonly session = inject(SessionStore);
}
