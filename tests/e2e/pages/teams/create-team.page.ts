import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class CreateTeamPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/teams/new');
  }

  async createTeam(name: string, description?: string): Promise<void> {
    await this.page.getByTestId('team-name-input').fill(name);
    if (description) {
      await this.page.getByTestId('description-input').fill(description);
    }
    await this.page.getByTestId('submit-button').click();
  }

  async expectNameValidationError(message: string): Promise<void> {
    await expect(this.page.getByTestId('name-error')).toBeVisible();
    await expect(this.page.getByTestId('name-error')).toContainText(message);
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.page.getByTestId('submit-button')).toBeDisabled();
  }
}
