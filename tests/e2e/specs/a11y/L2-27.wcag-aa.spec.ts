import { test, expect } from '@playwright/test';
import { AppShellComponent } from '../../pages/components/app-shell.component';

test('[L2-27] shell has zero critical/serious axe violations', async ({ page }) => {
  const shell = new AppShellComponent(page);
  await shell.goto('/');
  await shell.expectAccessible();
});

test('[L2-27] skip-to-content link is the first tab stop', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-shell"]');

  // The skip link must be the first interactive element in DOM order
  const firstInteractive = await page.evaluate(() => {
    const sel = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return document.querySelector(sel)?.className ?? '';
  });
  expect(firstInteractive).toContain('skip-link');

  // Verify it can receive focus
  const skipLink = page.locator('a.skip-link');
  await skipLink.focus();
  const active = await page.evaluate(() => document.activeElement?.className ?? '');
  expect(active).toContain('skip-link');
});
