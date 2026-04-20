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
}
