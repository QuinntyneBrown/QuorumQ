import { Page, expect } from '@playwright/test';

export class PresenceComponent {
  constructor(private readonly page: Page) {}

  async expectPresent(userIds: string[]): Promise<void> {
    for (const id of userIds) {
      await expect(this.page.getByTestId(`presence-user-${id}`)).toBeVisible();
    }
  }

  async expectCountOverflow(n: number): Promise<void> {
    await expect(this.page.getByTestId('presence-overflow')).toContainText(`+${n}`);
  }

  async expectPresenceRow(): Promise<void> {
    await expect(this.page.getByTestId('presence-row')).toBeVisible();
  }
}
