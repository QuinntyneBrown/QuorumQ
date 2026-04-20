import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { QqLiveAnnouncer } from '../../core/a11y/live-announcer';
import { buildSnackConfig, NotificationOptions } from './snack.config';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly announcer = inject(QqLiveAnnouncer);
  private readonly bp = inject(BreakpointObserver);

  private readonly queue: NotificationOptions[] = [];
  private active = false;

  show(options: NotificationOptions): void {
    this.queue.push(options);
    if (!this.active) this.flush();
  }

  private flush(): void {
    if (!this.queue.length) {
      this.active = false;
      return;
    }
    this.active = true;
    const opts = this.queue.shift()!;

    const isMobile = this.bp.isMatched([Breakpoints.XSmall, Breakpoints.Small]);
    const config = buildSnackConfig(opts.kind, isMobile, opts.duration);

    const ref = this.snackBar.open(opts.message, opts.action ?? 'Dismiss', config);

    if (opts.kind === 'warning' || opts.kind === 'error') {
      this.announcer.assertive(opts.message);
    } else {
      this.announcer.polite(opts.message);
    }

    ref.onAction().subscribe(() => {
      if (opts.deepLink) {
        this.router.navigateByUrl(opts.deepLink);
      }
    });

    ref.afterDismissed().subscribe(() => this.flush());
  }
}
