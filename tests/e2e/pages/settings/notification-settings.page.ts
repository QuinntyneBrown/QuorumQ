import { Page, expect } from '@playwright/test';

export class NotificationSettingsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/settings/notifications');
    await expect(this.page.getByTestId('notifications-tab')).toBeVisible({ timeout: 5000 });
  }

  async muteTeam(teamId: string): Promise<void> {
    const toggle = this.page.getByTestId(`mute-toggle-${teamId}`);
    const checked = await toggle.evaluate((el: HTMLInputElement) =>
      (el.querySelector('input') as HTMLInputElement)?.checked,
    );
    if (!checked) await toggle.click();
  }

  async unmuteTeam(teamId: string): Promise<void> {
    const toggle = this.page.getByTestId(`mute-toggle-${teamId}`);
    const checked = await toggle.evaluate((el: HTMLInputElement) =>
      (el.querySelector('input') as HTMLInputElement)?.checked,
    );
    if (checked) await toggle.click();
  }

  async expectMuted(teamId: string, muted: boolean): Promise<void> {
    const toggle = this.page.getByTestId(`mute-toggle-${teamId}`);
    const checked = await toggle.evaluate((el: Element) =>
      (el.querySelector('input') as HTMLInputElement)?.checked,
    );
    expect(checked).toBe(muted);
  }
}
