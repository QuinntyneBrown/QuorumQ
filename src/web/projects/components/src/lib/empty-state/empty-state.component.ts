import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'qq-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="qq-empty-state" role="status">
      <div class="qq-empty-state__illustration" aria-hidden="true">
        <ng-content select="[slot=illustration]" />
      </div>
      <h3 class="qq-empty-state__title">{{ title }}</h3>
      @if (description) {
        <p class="qq-empty-state__description">{{ description }}</p>
      }
      <div class="qq-empty-state__cta">
        <ng-content select="[slot=cta]" />
      </div>
    </div>
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input() description = '';
}
