import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatTabsModule],
  template: `
    <div class="page-shell" data-testid="settings-page">
      <h1 class="mat-headline-small">Settings</h1>
      <nav mat-tab-nav-bar [tabPanel]="tabPanel" data-testid="settings-tabs">
        <a mat-tab-link
           routerLink="account"
           routerLinkActive
           #accountLink="routerLinkActive"
           [active]="accountLink.isActive"
           data-testid="tab-account">
          Account
        </a>
        <a mat-tab-link
           routerLink="notifications"
           routerLinkActive
           #notifLink="routerLinkActive"
           [active]="notifLink.isActive"
           data-testid="tab-notifications">
          Notifications
        </a>
        <a mat-tab-link
           routerLink="theme"
           routerLinkActive
           #themeLink="routerLinkActive"
           [active]="themeLink.isActive"
           data-testid="tab-theme">
          Theme
        </a>
      </nav>
      <mat-tab-nav-panel #tabPanel>
        <router-outlet />
      </mat-tab-nav-panel>
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; max-width: 640px; margin: 0 auto; }
    h1 { margin: 0 0 16px; }
  `],
})
export class SettingsPage {}
