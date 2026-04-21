import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-vote-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button
      mat-stroked-button
      [class.voted]="youVoted"
      [disabled]="disabled"
      [attr.data-testid]="'vote-btn-' + suggestionId"
      [attr.aria-pressed]="youVoted"
      [attr.aria-label]="youVoted ? 'Clear vote for ' + restaurantName : 'Vote for ' + restaurantName"
      (click)="!disabled && toggle.emit(suggestionId)"
    >
      <mat-icon>thumb_up</mat-icon>
      {{ voteCount }}
    </button>
  `,
  styles: [`
    button { gap: 4px; }
    button.voted {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-color: var(--mat-sys-primary);
    }
  `],
})
export class VoteButtonComponent {
  @Input({ required: true }) suggestionId!: string;
  @Input({ required: true }) restaurantName!: string;
  @Input() voteCount = 0;
  @Input() youVoted = false;
  @Input() disabled = false;
  @Output() toggle = new EventEmitter<string>();
}
