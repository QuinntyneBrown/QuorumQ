import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { breakpoints } from '@components';

type Layout = 'mobile' | 'tablet' | 'desktop';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home', path: '/teams' },
  { label: 'History', icon: 'history', path: '/teams/history' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatSidenavModule, MatMenuModule, MatListModule, MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[attr.data-theme]': 'null',
    'data-testid': 'app-shell',
    '[attr.data-layout]': 'layout()',
  },
})
export class AppComponent implements OnInit {
  private readonly bp = inject(BreakpointObserver);

  readonly navItems = NAV_ITEMS;

  readonly layout = toSignal(
    this.bp.observe([
      `(min-width: ${breakpoints.md}px)`,
      `(min-width: ${breakpoints.lg}px)`,
    ]).pipe(
      map(state => {
        if (state.breakpoints[`(min-width: ${breakpoints.lg}px)`]) return 'desktop' as Layout;
        if (state.breakpoints[`(min-width: ${breakpoints.md}px)`]) return 'tablet' as Layout;
        return 'mobile' as Layout;
      }),
    ),
    { initialValue: 'mobile' as Layout },
  );

  get isMobile(): boolean { return this.layout() === 'mobile'; }
  get isTabletOrAbove(): boolean { return this.layout() !== 'mobile'; }

  ngOnInit(): void {}
}
