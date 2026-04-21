import { Page, expect } from '@playwright/test';

export class WinnerRevealPageObject {
  constructor(private readonly page: Page) {}

  async expectWinnerRevealWithin(ms: number): Promise<void> {
    await expect(this.page.getByTestId('winner-reveal')).toBeVisible({ timeout: ms });
  }

  async expectDirectionsLink(): Promise<void> {
    await expect(this.page.getByTestId('directions-btn')).toBeVisible();
    await expect(this.page.getByTestId('directions-btn')).not.toHaveAttribute('disabled');
  }

  async expectWebsiteLink(): Promise<void> {
    await expect(this.page.getByTestId('website-btn')).toBeVisible();
    await expect(this.page.getByTestId('website-btn')).not.toHaveClass(/disabled/);
  }

  async expectRandomChoiceChip(): Promise<void> {
    await expect(this.page.getByTestId('random-choice-chip')).toBeVisible();
  }

  async expectWinnerName(name: string): Promise<void> {
    await expect(this.page.getByTestId('winner-reveal')).toContainText(name);
  }
}
