import { Page, expect } from '@playwright/test';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/settings');
    await expect(this.page.getByTestId('settings-page')).toBeVisible({ timeout: 5000 });
  }

  async openTab(name: 'Account' | 'Notifications' | 'Theme'): Promise<void> {
    const testId = `tab-${name.toLowerCase()}`;
    await this.page.getByTestId(testId).click();
  }

  async selectTheme(choice: 'system' | 'light' | 'dark'): Promise<void> {
    await this.page.getByTestId(`theme-option-${choice}`).click();
  }

  async expectTheme(resolved: 'light' | 'dark'): Promise<void> {
    const isDark = await this.page.evaluate(() =>
      document.documentElement.classList.contains('theme-dark'),
    );
    if (resolved === 'dark') {
      expect(isDark).toBe(true);
    } else {
      expect(isDark).toBe(false);
    }
  }
}
