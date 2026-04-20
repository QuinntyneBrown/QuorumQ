import {
  Component, Input, OnChanges, ChangeDetectionStrategy, signal,
} from '@angular/core';

export interface VoteEntry {
  label: string;
  votes: number;
  color?: string;
}

@Component({
  selector: 'qq-vote-tally',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="qq-vote-tally" role="list" aria-label="Vote tally">
      @for (entry of entries(); track entry.label) {
        <div class="qq-vote-tally__row" role="listitem">
          <span class="qq-vote-tally__label">{{ entry.label }}</span>
          <div class="qq-vote-tally__bar-track" [attr.aria-valuenow]="entry.votes" [attr.aria-label]="entry.label + ': ' + entry.votes + ' votes'">
            <div
              class="qq-vote-tally__bar"
              [style.width.%]="barWidth(entry.votes)"
            ></div>
          </div>
          <span class="qq-vote-tally__count">{{ entry.votes }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './vote-tally.component.scss',
})
export class VoteTallyComponent implements OnChanges {
  @Input({ required: true }) votes: VoteEntry[] = [];

  readonly entries = signal<VoteEntry[]>([]);

  ngOnChanges(): void {
    this.entries.set(this.votes);
  }

  barWidth(votes: number): number {
    const max = Math.max(...this.entries().map(e => e.votes), 1);
    return (votes / max) * 100;
  }
}
