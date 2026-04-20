import { test, expect } from '@playwright/test';

test('[smoke] components render with theme tokens applied', async ({ page }) => {
  await page.goto('/_gallery');
  const gallery = page.getByTestId('components-gallery');
  await expect(gallery).toBeVisible();
  // Verify at least one qq- component rendered
  await expect(page.locator('qq-button').first()).toBeAttached();
  await expect(page.locator('qq-card').first()).toBeAttached();
});
