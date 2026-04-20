import { test, expect } from '@playwright/test';

test('[smoke] root element has a Material theme class applied', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('app-root');
  await expect(root).toBeAttached();
  // Verify the global stylesheet loaded (body should have no margin from reset)
  const bodyMargin = await page.evaluate(() => getComputedStyle(document.body).margin);
  expect(bodyMargin).toBe('0px');
});
