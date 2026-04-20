import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class SessionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(teamId: string, sessionId: string): Promise<void> {
    await this.page.goto(`/teams/${teamId}/sessions/${sessionId}`);
  }

  async expectSessionCard(): Promise<void> {
    await expect(this.page.getByTestId('session-card')).toBeVisible();
  }

  async expectState(state: string): Promise<void> {
    await expect(this.page.getByTestId('session-card')).toContainText(state, { ignoreCase: true });
  }

  async tapStartVoting(): Promise<void> {
    await this.page.getByTestId('start-voting-btn').click();
  }

  async cancelSession(): Promise<void> {
    await this.page.getByTestId('cancel-session-btn').click();
    await this.page.getByRole('button', { name: /cancel session/i }).last().click();
  }

  async expectCancelledBanner(): Promise<void> {
    await expect(this.page.getByTestId('cancelled-banner')).toBeVisible();
  }

  async expectStartVotingButton(): Promise<void> {
    await expect(this.page.getByTestId('start-voting-btn')).toBeVisible();
  }

  async expectCancelButton(): Promise<void> {
    await expect(this.page.getByTestId('cancel-session-btn')).toBeVisible();
  }
}
