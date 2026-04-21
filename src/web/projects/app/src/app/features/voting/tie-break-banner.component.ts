import { Component, Input } from '@angular/core';
import { CountdownComponent } from '@components';

@Component({
  selector: 'app-tie-break-banner',
  standalone: true,
  imports: [CountdownComponent],
  template: `
    <div class="tie-break-banner" data-testid="tie-break-banner" role="alert">
      <div class="tie-break-header">
        <span class="tie-break-title">Tie-break round!</span>
        <qq-countdown [deadline]="deadline" />
      </div>
      <p class="tie-break-msg">
        It's a tie — only the tied restaurants are votable now.
      </p>
    </div>
  `,
  styles: [`
    .tie-break-banner {
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .tie-break-header { display: flex; align-items: center; justify-content: space-between; }
    .tie-break-title { font-weight: 600; }
    .tie-break-msg { margin: 4px 0 0; font-size: 14px; }
  `],
})
export class TieBreakBannerComponent {
  @Input({ required: true }) deadline!: string;
}
