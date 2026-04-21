import { Page, expect } from '@playwright/test';

export class VotePanelPage {
  constructor(private readonly page: Page) {}

  async castVoteFor(suggestionId: string): Promise<void> {
    await this.page.getByTestId(`vote-btn-${suggestionId}`).click();
  }

  async expectVoteCount(suggestionId: string, count: number): Promise<void> {
    await expect(this.page.getByTestId(`vote-count-${suggestionId}`)).toContainText(`${count} vote`);
  }

  async expectYouVoted(suggestionId: string): Promise<void> {
    await expect(this.page.getByTestId(`vote-btn-${suggestionId}`)).toHaveClass(/voted/);
  }

  async expectNotVoted(suggestionId: string): Promise<void> {
    await expect(this.page.getByTestId(`vote-btn-${suggestionId}`)).not.toHaveClass(/voted/);
  }

  async expectTieBreakActive(): Promise<void> {
    await expect(this.page.getByTestId('tie-break-banner')).toBeVisible({ timeout: 15000 });
  }

  async expectOnlyTiedVotable(tiedIds: string[]): Promise<void> {
    const allBtns = this.page.locator('[data-testid^="vote-btn-"]');
    const count = await allBtns.count();
    for (let i = 0; i < count; i++) {
      const testId = (await allBtns.nth(i).getAttribute('data-testid')) ?? '';
      const id = testId.replace('vote-btn-', '');
      expect(tiedIds).toContain(id);
    }
    for (const id of tiedIds) {
      await expect(this.page.getByTestId(`vote-btn-${id}`)).toBeVisible();
    }
  }
}
