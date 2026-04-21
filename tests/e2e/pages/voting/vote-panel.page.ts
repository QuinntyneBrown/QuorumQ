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
}
