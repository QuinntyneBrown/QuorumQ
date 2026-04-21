import { Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-theme-page',
  standalone: true,
  imports: [MatButtonToggleModule, MatIconModule],
  template: `
    <div class="tab-content" data-testid="theme-tab">
      <h2 class="mat-title-medium">Appearance</h2>
      <p class="hint mat-body-small">
        Choose how QuorumQ looks. <em>System</em> follows your device's setting.
      </p>
      <mat-button-toggle-group
        [value]="themeService.theme()"
        (change)="themeService.setTheme($event.value)"
        aria-label="Theme"
        data-testid="theme-toggle"
      >
        <mat-button-toggle value="system" aria-label="System default" data-testid="theme-option-system">
          <mat-icon>brightness_auto</mat-icon>
          System
        </mat-button-toggle>
        <mat-button-toggle value="light" aria-label="Light" data-testid="theme-option-light">
          <mat-icon>light_mode</mat-icon>
          Light
        </mat-button-toggle>
        <mat-button-toggle value="dark" aria-label="Dark" data-testid="theme-option-dark">
          <mat-icon>dark_mode</mat-icon>
          Dark
        </mat-button-toggle>
      </mat-button-toggle-group>
    </div>
  `,
  styles: [`
    .tab-content { padding: 24px 0; }
    h2 { margin: 0 0 8px; }
    .hint { color: var(--mat-sys-on-surface-variant); margin: 0 0 20px; }
    mat-button-toggle-group { display: flex; gap: 0; }
  `],
})
export class ThemePage {
  readonly themeService = inject(ThemeService);
}
