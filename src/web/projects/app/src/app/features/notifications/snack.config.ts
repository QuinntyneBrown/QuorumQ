import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

export type NotificationKind = 'info' | 'success' | 'warning' | 'error';

export interface NotificationOptions {
  kind: NotificationKind;
  message: string;
  action?: string;
  duration?: number;
  deepLink?: string;
}

const DEFAULT_DURATION = 4000;

export function buildSnackConfig(
  kind: NotificationKind,
  isMobile: boolean,
  duration = DEFAULT_DURATION,
): MatSnackBarConfig {
  return {
    duration,
    panelClass: [`qq-snack`, `qq-snack--${kind}`],
    horizontalPosition: 'center',
    verticalPosition: isMobile ? 'top' : 'bottom',
  };
}
