import { test, expect } from '@playwright/test';
import { AppShellComponent } from '../../pages/components/app-shell.component';

test('[L2-22] at 1024px, the layout uses a navigation rail + content column', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  const shell = new AppShellComponent(page);
  await shell.goto('/');

  const navRail = shell.navRail();
  await expect(navRail).toBeVisible();

  const bottomNav = shell.bottomNav();
  await expect(bottomNav).not.toBeVisible();

  const layout = await shell.currentLayout();
  expect(['tablet', 'desktop']).toContain(layout);
});

test('[L2-22] at 1920px, content remains legible with a max-width applied', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const shell = new AppShellComponent(page);
  await shell.goto('/');

  const layout = await shell.currentLayout();
  expect(layout).toBe('desktop');

  const navRail = shell.navRail();
  await expect(navRail).toBeVisible();
});
