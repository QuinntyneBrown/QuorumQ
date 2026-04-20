import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function expectNoA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(
    blocking,
    `Accessibility violations:\n${JSON.stringify(blocking, null, 2)}`,
  ).toHaveLength(0);
}
