import { test, expect } from '@playwright/test';
import { AppShellComponent } from '../../pages/components/app-shell.component';

test.use({ viewport: { width: 375, height: 812 } });

test('[L2-21] at 375px, primary actions are within the bottom third of the viewport', async ({ page }) => {
  const shell = new AppShellComponent(page);
  await shell.goto('/');

  const bottomNav = shell.bottomNav();
  await expect(bottomNav).toBeVisible();

  const box = await bottomNav.boundingBox();
  expect(box).not.toBeNull();

  const viewportHeight = 812;
  const bottomThirdStart = (viewportHeight * 2) / 3;
  expect(box!.y).toBeGreaterThanOrEqual(bottomThirdStart);
});

test('[L2-21] at 375px, no horizontal scrolling occurs on the shell', async ({ page }) => {
  const shell = new AppShellComponent(page);
  await shell.goto('/');

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});
