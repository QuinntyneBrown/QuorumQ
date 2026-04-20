import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/auth/auth.service';
import { SessionStore } from './core/auth/session.store';

type Layout = 'mobile' | 'tablet' | 'desktop';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    'data-testid': 'app-shell',
    '[attr.data-layout]': 'layout()',
  },
})
export class App {
  private readonly bp = inject(BreakpointObserver);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  readonly navItems: NavItem[] = [
    { label: 'Home', icon: 'home', route: '/teams' },
    { label: 'History', icon: 'history', route: '/history' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  private readonly bpState = toSignal(
    this.bp.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium]).pipe(
      map(state => {
        if (state.breakpoints[Breakpoints.XSmall] || state.breakpoints[Breakpoints.Small]) {
          return 'mobile' as Layout;
        }
        if (state.breakpoints[Breakpoints.Medium]) {
          return 'tablet' as Layout;
        }
        return 'desktop' as Layout;
      }),
    ),
    { initialValue: 'desktop' as Layout },
  );

  readonly layout = computed(() => this.bpState() ?? 'desktop');
  readonly isMobile = computed(() => this.layout() === 'mobile');
  readonly isDesktop = computed(() => this.layout() === 'desktop');
  readonly drawerOpen = signal(true);

  toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  signOut(): void {
    this.auth.signOut().subscribe({
      next: () => {
        this.session.clearUser();
        this.router.navigate(['/auth/sign-in']);
      },
      error: () => {
        this.session.clearUser();
        this.router.navigate(['/auth/sign-in']);
      },
    });
  }
}
