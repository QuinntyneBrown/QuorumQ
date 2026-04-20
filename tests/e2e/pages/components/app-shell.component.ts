import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export type ShellLayout = 'mobile' | 'tablet' | 'desktop';

export class AppShellComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForSelector('[data-testid="app-shell"]');
  }

  async currentLayout(): Promise<ShellLayout> {
    const attr = await this.page.locator('[data-testid="app-shell"]').getAttribute('data-layout');
    return (attr ?? 'mobile') as ShellLayout;
  }

  async openPrimaryNav(): Promise<void> {
    const bottomNav = this.page.locator('[data-testid="bottom-nav"]');
    const navRail = this.page.locator('[data-testid="nav-rail"]');
    if (await bottomNav.isVisible()) return;
    if (await navRail.isVisible()) return;
  }

  async focusSignOut(): Promise<void> {
    const menuBtn = this.page.getByRole('button', { name: /account menu/i });
    await menuBtn.click();
    const signOut = this.page.getByRole('menuitem', { name: /sign out/i });
    await signOut.focus();
  }

  bottomNav(): Locator {
    return this.page.locator('[data-testid="bottom-nav"]');
  }

  navRail(): Locator {
    return this.page.locator('[data-testid="nav-rail"]');
  }

  appBar(): Locator {
    return this.page.locator('mat-toolbar.app-bar');
  }
}
