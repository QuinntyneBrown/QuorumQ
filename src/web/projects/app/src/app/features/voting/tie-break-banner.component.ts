import { Component, Input } from '@angular/core';
import { CountdownComponent } from '@components';

@Component({
  selector: 'app-tie-break-banner',
  standalone: true,
  imports: [CountdownComponent],
  template: `
    <div class="tie-break-banner" data-testid="tie-break-banner" role="alert">
      <div class="header">
        <strong>Tie-break round</strong>
        <span class="hint">Only tied suggestions can be voted on</span>
      </div>
      @if (deadline) {
        <qq-countdown class="countdown" [deadline]="deadline" />
      }
    </div>
  `,
  styles: [`
    .tie-break-banner {
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }
    .header { display: flex; flex-direction: column; gap: 2px; }
    .hint { font-size: 13px; opacity: 0.8; }
    .countdown { font-size: 20px; font-weight: 700; }
  `],
})
export class TieBreakBannerComponent {
  @Input() deadline: string | null = null;
}
