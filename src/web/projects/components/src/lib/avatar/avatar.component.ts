import { Component, Input, ChangeDetectionStrategy, computed, signal } from '@angular/core';

@Component({
  selector: 'qq-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="qq-avatar"
      [class.qq-avatar--sm]="size === 'sm'"
      [class.qq-avatar--md]="size === 'md'"
      [class.qq-avatar--lg]="size === 'lg'"
      [attr.role]="'img'"
      [attr.aria-label]="name || 'Avatar'"
    >
      @if (src) {
        <img [src]="src" [alt]="name || ''" class="qq-avatar__image" (error)="onImgError()" />
      } @else {
        <span class="qq-avatar__initials" aria-hidden="true">{{ initials() }}</span>
      }
    </div>
  `,
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  readonly initials = computed(() =>
    this.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join(''),
  );

  onImgError(): void {
    this.src = undefined;
  }
}
