import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export type CardElevation = 0 | 1 | 2 | 3;

@Component({
  selector: 'qq-card',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card [class]="'qq-card qq-card--elev-' + elevation" [attr.appearance]="appearance">
      <ng-content />
    </mat-card>
  `,
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() elevation: CardElevation = 1;
  @Input() appearance: 'raised' | 'outlined' | 'filled' = 'raised';
}
