import { Page, Download, expect } from '@playwright/test';

export class SessionHistoryPage {
  constructor(private readonly page: Page) {}

  async goto(teamId: string): Promise<void> {
    await this.page.goto(`/teams/${teamId}/history`);
    await expect(this.page.getByTestId('session-history')).toBeVisible({ timeout: 4000 });
  }

  async expectSessionsListed(count: number): Promise<void> {
    const list = this.page.getByTestId('history-list');
    await expect(list).toBeVisible();
    const items = list.locator('[data-testid^="history-item-"]');
    await expect(items).toHaveCount(count);
  }

  async openSession(winnerName: string): Promise<void> {
    const items = this.page.locator('[data-testid^="session-winner-"]');
    const item = items.filter({ hasText: winnerName });
    await item.click();
    await expect(this.page.getByTestId('session-history-detail')).toBeVisible({ timeout: 4000 });
  }

  async expectReadOnly(): Promise<void> {
    await expect(this.page.getByTestId('read-only-badge')).toBeVisible();
  }

  async tapExportCsv(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByTestId('export-csv-btn').click(),
    ]);
    return download;
  }

  async expectDownloadMatches(schema: string[]): Promise<void> {
    const download = await this.tapExportCsv();
    const content = await download.createReadStream();
    let text = '';
    for await (const chunk of content) {
      text += chunk.toString();
    }
    for (const col of schema) {
      expect(text).toContain(col);
    }
  }
}
