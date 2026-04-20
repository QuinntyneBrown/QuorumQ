import {
  Component, Input, Output, EventEmitter, OnDestroy, OnInit,
  ChangeDetectionStrategy, signal, computed, PLATFORM_ID, inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'qq-countdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="qq-countdown" role="timer" [attr.aria-label]="'Time remaining: ' + displayTime()">
      <span class="qq-countdown__value">{{ displayTime() }}</span>
    </div>
  `,
  styleUrl: './countdown.component.scss',
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input({ required: true }) deadline!: Date | string;
  @Output() ended = new EventEmitter<void>();

  private readonly platformId = inject(PLATFORM_ID);
  private intervalId?: ReturnType<typeof setInterval>;
  private readonly remaining = signal(0);

  readonly displayTime = computed(() => {
    const s = this.remaining();
    if (s <= 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.tick();
    if (isPlatformBrowser(this.platformId)) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const interval = prefersReduced ? 1000 : 250;
      this.intervalId = setInterval(() => this.tick(), interval);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private tick(): void {
    const now = Date.now();
    const end = new Date(this.deadline).getTime();
    const diff = Math.max(0, Math.round((end - now) / 1000));
    this.remaining.set(diff);
    if (diff === 0) {
      if (this.intervalId) clearInterval(this.intervalId);
      this.ended.emit();
    }
  }
}
