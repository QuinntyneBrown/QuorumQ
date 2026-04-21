import { Page, expect } from '@playwright/test';

export class WinnerRevealPage {
  constructor(private readonly page: Page) {}

  async expectWinnerRevealWithin(ms: number): Promise<void> {
    await expect(this.page.getByTestId('winner-reveal-page')).toBeVisible({ timeout: ms });
  }

  async expectDirectionsLink(): Promise<void> {
    await expect(this.page.getByTestId('directions-link')).toBeVisible({ timeout: 5000 });
  }

  async expectWebsiteLink(): Promise<void> {
    await expect(this.page.getByTestId('website-link')).toBeVisible({ timeout: 5000 });
  }

  async expectRandomChoiceChip(): Promise<void> {
    await expect(this.page.getByTestId('random-choice-chip')).toBeVisible({ timeout: 5000 });
  }
}
