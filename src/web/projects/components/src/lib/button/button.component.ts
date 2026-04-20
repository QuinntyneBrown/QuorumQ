import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'icon';

@Component({
  selector: 'qq-button',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [attr.mat-button]="variant === 'text' ? '' : null"
      [attr.mat-filled-button]="variant === 'filled' ? '' : null"
      [attr.mat-tonal-button]="variant === 'tonal' ? '' : null"
      [attr.mat-outlined-button]="variant === 'outlined' ? '' : null"
      [attr.mat-elevated-button]="variant === 'elevated' ? '' : null"
      [attr.mat-icon-button]="variant === 'icon' ? '' : null"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading || null"
      class="qq-button"
      [class.qq-button--loading]="loading"
    >
      <mat-spinner *ngIf="loading" diameter="18" class="qq-button__spinner" />
      <ng-content />
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'filled';
  @Input() disabled = false;
  @Input() loading = false;
}
