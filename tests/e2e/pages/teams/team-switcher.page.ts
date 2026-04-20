import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class TeamSwitcherPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openSwitcher(): Promise<void> {
    await this.page.getByTestId('team-switcher-trigger').click();
    await expect(this.page.locator('mat-menu')).toBeVisible().catch(() => {});
  }

  async switchTo(teamName: string): Promise<void> {
    await this.openSwitcher();
    await this.page.getByRole('menuitem', { name: teamName }).click();
  }

  async teamsListed(): Promise<string[]> {
    await this.openSwitcher();
    const items = this.page.locator('[data-testid^="team-item-"]');
    const count = await items.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push(await items.nth(i).textContent() ?? '');
    }
    return names.map(n => n.trim());
  }

  async currentTeamName(): Promise<string> {
    const text = await this.page.getByTestId('team-switcher-trigger').textContent();
    return text?.trim() ?? '';
  }
}
