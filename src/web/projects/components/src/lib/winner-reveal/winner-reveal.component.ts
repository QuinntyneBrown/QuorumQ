import {
  Component, Input, Output, EventEmitter, signal,
  ChangeDetectionStrategy,
} from '@angular/core';


@Component({
  selector: 'qq-winner-reveal',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="qq-winner-reveal"
      [class.qq-winner-reveal--visible]="revealed()"
      role="region"
      [attr.aria-live]="'assertive'"
      [attr.aria-label]="revealed() ? 'Winner: ' + winner() : 'Winner not yet revealed'"
    >
      @if (revealed()) {
        <div class="qq-winner-reveal__content">
          <div class="qq-winner-reveal__trophy" aria-hidden="true">🏆</div>
          <h2 class="qq-winner-reveal__name">{{ winner() }}</h2>
          <ng-content />
        </div>
      }
    </div>
  `,
  styleUrl: './winner-reveal.component.scss',
})
export class WinnerRevealComponent {
  readonly revealed = signal(false);
  readonly winner = signal('');

  reveal(winnerName: string): void {
    this.winner.set(winnerName);
    this.revealed.set(true);
  }

  reset(): void {
    this.revealed.set(false);
    this.winner.set('');
  }
}
