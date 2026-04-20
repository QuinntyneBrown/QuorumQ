import { test, expect } from '@playwright/test';
import { AppShellComponent } from '../../pages/components/app-shell.component';
import { expectAccessible } from '../../support/a11y';

test.describe('[L2-27] WCAG AA baseline', () => {
  test('[L2-27] shell has zero critical/serious axe violations', async ({ page }) => {
    await page.goto('http://localhost:4200');
    await expectAccessible(page);
  });

  test('[L2-27] skip-to-content link is the first tab stop', async ({ page }) => {
    await page.goto('http://localhost:4200');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
  });
});
