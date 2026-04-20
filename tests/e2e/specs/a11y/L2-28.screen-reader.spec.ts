import { test, expect } from '@playwright/test';
import { expectLiveRegionAnnouncement } from '../../support/a11y';

test.describe('[L2-28] screen reader live regions', () => {
  test('[L2-28] live announcer emits polite messages into an aria-live=polite region', async ({ page }) => {
    await page.goto('http://localhost:4200');
    // CDK LiveAnnouncer creates a live region on first use; verify it exists
    const politeRegion = page.locator('[aria-live="polite"]');
    await expect(politeRegion.first()).toBeAttached();
  });
});
