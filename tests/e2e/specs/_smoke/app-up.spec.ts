import { test, expect } from '@playwright/test';

test('[smoke] Angular app boots and renders root shell', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await expect(page.locator('app-root')).toBeAttached();
});
