import { test, expect } from '@playwright/test';

test('[smoke] root element has a Material theme class applied', async ({ page }) => {
  await page.goto('/');
  const bg = await page.evaluate(() =>
    getComputedStyle(document.documentElement).backgroundColor
  );
  // Light theme surface #FBF7F1 = rgb(251, 247, 241)
  expect(bg).toBe('rgb(251, 247, 241)');
});
