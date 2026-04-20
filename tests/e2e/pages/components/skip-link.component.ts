import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class SkipLinkComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  skipLink(): Locator {
    return this.page.locator('a.skip-link');
  }

  mainContent(): Locator {
    return this.page.locator('#main');
  }

  async focusSkipLink(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async activateSkipLink(): Promise<void> {
    await this.focusSkipLink();
    await this.page.keyboard.press('Enter');
  }

  async expectSkipLinkFocused(): Promise<void> {
    await expect(this.page.locator('.skip-link')).toBeFocused();
  }

  async expectMainContentFocused(): Promise<void> {
    await expect(this.page.locator('#main')).toBeFocused();
  }
}
