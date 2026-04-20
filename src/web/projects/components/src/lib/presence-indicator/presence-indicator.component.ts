import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'qq-presence-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="qq-presence"
      [class.qq-presence--online]="online"
      [class.qq-presence--offline]="!online"
      [attr.aria-label]="online ? 'Online' : 'Offline'"
      role="img"
    ></span>
  `,
  styleUrl: './presence-indicator.component.scss',
})
export class PresenceIndicatorComponent {
  @Input() online = false;
}
