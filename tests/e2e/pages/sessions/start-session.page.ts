import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class StartSessionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(teamId: string): Promise<void> {
    await this.page.goto(`/teams/${teamId}/sessions/new`);
  }

  async chooseDeadline(minutes: number): Promise<void> {
    const input = this.page.getByTestId('deadline-input');
    await input.fill(String(minutes));
    await input.dispatchEvent('change');
  }

  async startLunch(): Promise<void> {
    await this.page.getByTestId('start-lunch-btn').click();
  }

  async expectRedirectedToExisting(): Promise<void> {
    await expect(this.page).toHaveURL(/\/teams\/.+\/sessions\/.+/);
    await expect(this.page.getByTestId('session-card')).toBeVisible();
  }

  async expectValidationError(): Promise<void> {
    await expect(this.page.getByTestId('start-error')).toBeVisible();
  }

  async expectDeadlineHint(): Promise<void> {
    await expect(this.page.getByTestId('deadline-hint')).toBeVisible();
  }
}
