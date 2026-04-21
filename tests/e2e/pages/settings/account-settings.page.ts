import { Page, expect } from '@playwright/test';

export class AccountSettingsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/settings/account');
    await expect(this.page.getByTestId('account-tab')).toBeVisible({ timeout: 5000 });
  }

  async deleteAccount(): Promise<void> {
    await this.page.getByTestId('delete-account-btn').click();
    // Confirm in the dialog
    await this.page.locator('mat-dialog-container').waitFor({ state: 'visible', timeout: 3000 });
    await this.page.locator('[mat-dialog-close="true"], button:has-text("Delete my account")').click();
  }

  async expectAccountGone(): Promise<void> {
    await expect(this.page).toHaveURL(/sign-in/, { timeout: 5000 });
  }
}
