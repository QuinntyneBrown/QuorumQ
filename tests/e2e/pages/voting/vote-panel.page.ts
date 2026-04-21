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
    await expect(this.page.getByTestId('tie-break-banner')).toBeVisible();
  }

  async expectOnlyTiedVotable(votableSuggestionIds: string[], allSuggestionIds: string[]): Promise<void> {
    for (const id of votableSuggestionIds) {
      await expect(this.page.getByTestId(`vote-btn-${id}`)).not.toBeDisabled();
    }
    for (const id of allSuggestionIds.filter(id => !votableSuggestionIds.includes(id))) {
      await expect(this.page.getByTestId(`vote-btn-${id}`)).toBeDisabled();
    }
  }
}
