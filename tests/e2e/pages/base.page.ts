import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForToast(text?: string): Promise<void> {
    const locator = this.page.getByRole('alert');
    await expect(locator).toBeVisible();
    if (text) await expect(locator).toContainText(text);
  }

  async expectAccessible(): Promise<void> {
    const results = await new AxeBuilder({ page: this.page }).analyze();
    const violations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(violations, `a11y violations: ${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
  }

  async expectNoCLS(): Promise<void> {
    const cls = await this.page.evaluate((): number => {
      return (performance.getEntriesByType('layout-shift') as LayoutShift[]).reduce(
        (sum, e) => sum + e.value,
        0,
      );
    });
    expect(cls, `CLS score ${cls} exceeds 0.1`).toBeLessThan(0.1);
  }
}
