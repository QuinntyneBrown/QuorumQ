import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface A11yOptions {
  include?: string[];
  exclude?: string[];
}

export async function expectAccessible(page: Page, options?: A11yOptions): Promise<void> {
  let builder = new AxeBuilder({ page });
  if (options?.include) builder = builder.include(options.include);
  if (options?.exclude) builder = builder.exclude(options.exclude);

  const results = await builder.analyze();
  const violations = results.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(
    violations,
    `Accessibility violations:\n${JSON.stringify(violations, null, 2)}`,
  ).toHaveLength(0);
}

export async function expectLiveRegionAnnouncement(page: Page, text: string): Promise<void> {
  const region = page.locator('[aria-live="polite"], [aria-live="assertive"]');
  await expect(region.first()).toContainText(text, { timeout: 5000 });
}
