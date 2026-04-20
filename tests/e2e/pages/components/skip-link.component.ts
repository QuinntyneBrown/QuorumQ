import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class SkipLinkComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async tabToSkipLink(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async activateSkipLink(): Promise<void> {
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }

  async expectSkipLinkFocused(): Promise<void> {
    await expect(this.page.locator('.skip-link')).toBeFocused();
  }

  async expectMainContentFocused(): Promise<void> {
    await expect(this.page.locator('#main')).toBeFocused();
  }
}
