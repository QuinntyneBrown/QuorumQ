import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class TeamDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(teamId: string): Promise<void> {
    await this.page.goto(`/teams/${teamId}`);
  }

  async expectActiveSessionCard(): Promise<void> {
    await expect(this.page.getByTestId('active-session-card')).toBeVisible();
  }

  async expectStartLunchCta(): Promise<void> {
    await expect(this.page.getByTestId('start-lunch-btn')).toBeVisible();
  }

  async tapStartLunch(): Promise<void> {
    await this.page.getByTestId('start-lunch-btn').click();
  }
}
