import { Page } from '@playwright/test';

export async function mockClock(page: Page, isoDate: string): Promise<void> {
  await page.clock.setFixedTime(new Date(isoDate));
}

export async function advanceClock(page: Page, ms: number): Promise<void> {
  await page.clock.runFor(ms);
}
