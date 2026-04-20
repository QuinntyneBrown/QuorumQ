import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class TeamInvitePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(teamId: string): Promise<void> {
    await this.page.goto(`/teams/${teamId}/invites`);
  }

  async generateInvite(): Promise<string> {
    await this.page.getByTestId('generate-invite-btn').click();
    const row = this.page.getByTestId('invite-list').locator('li').first();
    await expect(row).toBeVisible();
    const copyBtn = row.getByTestId('copy-invite-btn');
    await copyBtn.click();
    return '';
  }

  async getInviteUrl(index = 0): Promise<string> {
    const row = this.page.getByTestId('invite-list').locator('li').nth(index);
    await expect(row).toBeVisible();
    // Grab the URL via data attribute — we inject it via evaluate
    const url = await this.page.evaluate((idx: number) => {
      const rows = document.querySelectorAll('[data-testid="invite-list"] li');
      const row = rows[idx] as HTMLElement | undefined;
      return row?.dataset?.['inviteUrl'] ?? '';
    }, index);
    return url;
  }

  async copyInviteLink(index = 0): Promise<void> {
    const row = this.page.getByTestId('invite-list').locator('li').nth(index);
    await row.getByTestId('copy-invite-btn').click();
  }

  async revokeInvite(index = 0): Promise<void> {
    const row = this.page.getByTestId('invite-list').locator('li').nth(index);
    await row.getByTestId('revoke-invite-btn').click();
    await this.page.getByRole('button', { name: 'Revoke' }).click();
  }
}
