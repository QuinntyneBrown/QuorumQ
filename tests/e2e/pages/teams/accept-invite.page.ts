import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class AcceptInvitePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(token: string): Promise<void> {
    await this.page.goto(`/invites/${token}`);
  }

  async acceptInvite(): Promise<void> {
    await this.page.getByTestId('accept-btn').click();
    await expect(this.page).toHaveURL(/\/teams\/[0-9a-f-]{36}/);
  }

  async expectInviteInvalid(): Promise<void> {
    await expect(this.page.getByTestId('invite-invalid')).toBeVisible();
  }
}
