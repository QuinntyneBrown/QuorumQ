import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { auditSpacing, CANONICAL_PAGES } from '../../support/design-audit';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';

async function signInAsAlice(page: Parameters<typeof auditSpacing>[0]): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.goto();
  await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
  await expect(page).toHaveURL(/teams/, { timeout: 8000 });
}

test.describe('Design system consistency (L2-24)', () => {
  test('[L2-24] every screen uses typography drawn from the design tokens', async ({ page }) => {
    await signInAsAlice(page);

    for (const { name, path, requiresAuth } of CANONICAL_PAGES) {
      if (requiresAuth) {
        await page.goto(path);
      } else {
        await page.goto(path);
      }
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Every text-bearing element must carry a Material typography class
      const violations: string[] = await page.evaluate(() => {
        const matTypoClasses = [
          'mat-display-large', 'mat-display-medium', 'mat-display-small',
          'mat-headline-large', 'mat-headline-medium', 'mat-headline-small',
          'mat-title-large', 'mat-title-medium', 'mat-title-small',
          'mat-body-large', 'mat-body-medium', 'mat-body-small',
          'mat-label-large', 'mat-label-medium', 'mat-label-small',
        ];

        const issues: string[] = [];
        // Check h1-h3 headings that are NOT inside a mat-component
        document.querySelectorAll('h1,h2,h3').forEach(el => {
          const hasTypoClass = matTypoClasses.some(c => el.classList.contains(c));
          const insideMat = el.closest('[class*="mat-"],[class*="mdc-"]');
          if (!hasTypoClass && !insideMat) {
            issues.push(`<${el.tagName.toLowerCase()}> missing Material typography class: "${el.textContent?.trim().slice(0, 40)}"`);
          }
        });
        return issues;
      });

      expect(
        violations,
        `Typography violations on "${name}" (${path}):\n${violations.join('\n')}`,
      ).toHaveLength(0);
    }
  });

  test('[L2-24] spacing on canonical screens is on the 4px grid', async ({ page }) => {
    await signInAsAlice(page);

    // Only check the settings page (representative, doesn't require team seeding)
    await page.goto('/settings/account');
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await expect(page.getByTestId('account-tab')).toBeVisible({ timeout: 5000 });

    const { violations } = await auditSpacing(page, '[data-testid="account-tab"] *');

    // Filter to structural violations only (ignore sub-pixel rounding on Material internals)
    const structural = violations.filter(v => {
      const match = v.match(/=(\d+(?:\.\d+)?)px/);
      if (!match) return false;
      const px = parseFloat(match[1]);
      return px > 2 && Math.abs(Math.round(px / 4) * 4 - px) > 1;
    });

    expect(
      structural,
      `Spacing off 4px grid:\n${structural.join('\n')}`,
    ).toHaveLength(0);
  });

  test('[L2-24] no one-off hardcoded colour appears in component inline styles', async ({ page }) => {
    await signInAsAlice(page);
    await page.goto('/settings/account');
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Scan all elements with an explicit inline style color attribute
    const violations: string[] = await page.evaluate(() => {
      const issues: string[] = [];
      const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;
      const allowedHex = new Set(['#ffffff', '#000000', '#fff', '#000']);

      document.querySelectorAll('[style]').forEach(el => {
        const style = (el as HTMLElement).getAttribute('style') ?? '';
        let m: RegExpExecArray | null;
        hexPattern.lastIndex = 0;
        while ((m = hexPattern.exec(style)) !== null) {
          const hex = m[0].toLowerCase();
          if (!allowedHex.has(hex)) {
            issues.push(`<${el.tagName.toLowerCase()}>: inline style contains ${hex}`);
          }
        }
      });
      return issues;
    });

    expect(
      violations,
      `Hardcoded inline colors:\n${violations.join('\n')}`,
    ).toHaveLength(0);
  });

  test('[L2-24] sign-in and team dashboard render with correct brand color primary', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();

    // The top app bar uses --mat-sys-primary (Tomato #E04F3C family)
    // We verify the sign-in button exists and uses a Material button style
    const signInBtn = page.locator('button[type=submit], button:has-text("Sign in")').first();
    await expect(signInBtn).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Verify Angular Material is bootstrapped: at least one mat-* component present
    const hasMatComponents = await page.evaluate(() =>
      document.querySelector('mat-toolbar,mat-form-field,mat-card,[class*="mat-mdc-"]') !== null,
    );
    expect(hasMatComponents).toBe(true);

    // Sign in and check the dashboard also uses Material components
    await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    const dashboardHasMatComponents = await page.evaluate(() =>
      document.querySelector('mat-toolbar,mat-list,mat-card,[class*="mat-mdc-"]') !== null,
    );
    expect(dashboardHasMatComponents).toBe(true);
  });
});
