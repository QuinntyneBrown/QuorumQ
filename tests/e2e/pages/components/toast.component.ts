import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class ToastComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async awaitToast(text?: string): Promise<void> {
    const snack = this.page.locator('mat-snack-bar-container');
    await expect(snack).toBeVisible({ timeout: 5000 });
    if (text) await expect(snack).toContainText(text);
  }

  async dismissToast(): Promise<void> {
    const btn = this.page.locator('mat-snack-bar-container button');
    if (await btn.isVisible()) await btn.click();
  }

  async toastHasKindClass(kind: 'info' | 'success' | 'warning' | 'error'): Promise<boolean> {
    const snack = this.page.locator(`mat-snack-bar-container.qq-snack--${kind}`);
    return snack.isVisible();
  }
}
