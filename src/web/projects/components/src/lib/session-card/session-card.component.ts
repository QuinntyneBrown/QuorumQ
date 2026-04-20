import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

export type SessionStatus = 'suggesting' | 'voting' | 'decided' | 'cancelled';

@Component({
  selector: 'qq-session-card',
  standalone: true,
  imports: [MatCardModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="qq-session-card">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
        <mat-chip class="qq-session-card__status-chip qq-session-card__status-chip--{{ status }}">
          {{ status }}
        </mat-chip>
      </mat-card-header>
      <mat-card-content>
        <div class="qq-session-card__countdown">
          <ng-content select="[slot=countdown]" />
        </div>
        <ng-content />
      </mat-card-content>
      <mat-card-actions class="qq-session-card__actions">
        <ng-content select="[slot=actions]" />
      </mat-card-actions>
    </mat-card>
  `,
  styleUrl: './session-card.component.scss',
})
export class SessionCardComponent {
  @Input() title = '';
  @Input() status: SessionStatus = 'suggesting';
}
