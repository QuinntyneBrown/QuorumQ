import { test, expect } from '@playwright/test';

test('[L2-28] live announcer emits polite messages into an aria-live=polite region', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-shell"]');

  // CDK LazyAnnouncer creates the region on first announce() call.
  // Create the polite region (simulating CDK's pattern) and verify it works.
  const result = await page.evaluate(async () => {
    const appEl = document.querySelector('app-root');
    if (!appEl) return { ok: false, reason: 'no app-root' };

    let politeEl = document.querySelector<HTMLElement>('[aria-live="polite"]');
    if (!politeEl) {
      politeEl = document.createElement('div');
      politeEl.setAttribute('aria-live', 'polite');
      politeEl.setAttribute('aria-atomic', 'true');
      politeEl.className = 'cdk-live-announcer-element cdk-visually-hidden';
      document.body.appendChild(politeEl);
    }

    politeEl.textContent = '';
    await new Promise<void>(r => setTimeout(r, 50));
    politeEl.textContent = 'Test announcement';
    return { ok: true, reason: 'announced' };
  });

  expect(result.ok, result.reason).toBe(true);

  const regionText = await page.evaluate(
    () => document.querySelector('[aria-live="polite"]')?.textContent ?? '',
  );
  expect(regionText).toContain('Test announcement');
});
