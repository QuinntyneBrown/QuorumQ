import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SettingsPage } from '../../pages/settings/settings.page';
import {
  assertMinTouchTarget,
  assertKeyboardAccessible,
  assertArrowTabReachable,
} from '../../pages/components/interactive-probe';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

test.describe('Touch / pointer / keyboard parity (L2-23)', () => {
  test('[L2-23] every interactive element in the shell is reachable and operable via keyboard with a visible focus ring', async ({
    page,
  }) => {
    // ── Sign-in page ──────────────────────────────────────────────────────────
    const signIn = new SignInPage(page);
    await signIn.goto();

    await assertKeyboardAccessible(page, page.getByTestId('email-input'), 'email input');
    await assertKeyboardAccessible(page, page.getByTestId('password-input'), 'password input');
    await assertKeyboardAccessible(
      page,
      page.getByTestId('forgot-password-link'),
      'forgot password link',
    );

    // Fill form so the submit button is enabled, then check it.
    await page.getByTestId('email-input').fill(ALICE_EMAIL);
    await page.getByTestId('password-input').fill(ALICE_PASSWORD);
    await assertKeyboardAccessible(
      page,
      page.getByTestId('submit-button').locator('button'),
      'sign-in submit button',
    );

    // ── Authenticated shell ───────────────────────────────────────────────────
    await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    // ── Bottom nav (mobile 375 px) ────────────────────────────────────────────
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/teams/${ALICE_TEAM_ID}`);

    const bottomNav = page.getByTestId('bottom-nav');
    await expect(bottomNav).toBeVisible();

    const navLinks = bottomNav.locator('a');
    const navCount = await navLinks.count();
    expect(navCount, 'bottom nav should have ≥ 2 items').toBeGreaterThanOrEqual(2);

    for (let i = 0; i < navCount; i++) {
      const link = navLinks.nth(i);
      const ariaLabel = (await link.getAttribute('aria-label')) ?? `nav item ${i}`;
      await assertKeyboardAccessible(page, link, `bottom nav: ${ariaLabel}`);
    }

    // Account menu button in app bar
    await assertKeyboardAccessible(
      page,
      page.getByRole('button', { name: /account menu/i }),
      'app bar: account menu button',
    );

    // ── Settings tabs (mat-tab-nav-bar — roving tabindex + ArrowRight) ────────
    const settings = new SettingsPage(page);
    await settings.goto();

    // Tab to the active Account tab first.
    await assertKeyboardAccessible(
      page,
      page.getByTestId('tab-account'),
      'settings: Account tab',
    );
    // Inactive tabs use tabindex=-1; they're reachable via ArrowRight.
    await assertArrowTabReachable(
      page,
      page.getByTestId('tab-notifications'),
      'settings: Notifications tab',
    );
    await assertArrowTabReachable(
      page,
      page.getByTestId('tab-theme'),
      'settings: Theme tab',
    );
  });

  test('[L2-23] every interactive element meets a 44×44 CSS pixel touch target at 375 px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // ── Sign-in form ──────────────────────────────────────────────────────────
    const signIn = new SignInPage(page);
    await signIn.goto();

    await assertMinTouchTarget(
      page.getByTestId('submit-button').locator('button'),
      'sign-in: submit button',
    );
    await assertMinTouchTarget(
      page.getByTestId('forgot-password-link'),
      'sign-in: forgot password link',
    );

    // ── Authenticated shell ───────────────────────────────────────────────────
    await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    await page.goto(`/teams/${ALICE_TEAM_ID}`);

    // Bottom nav items
    const bottomNav = page.getByTestId('bottom-nav');
    await expect(bottomNav).toBeVisible();
    const navLinks = bottomNav.locator('a');
    const navCount = await navLinks.count();
    for (let i = 0; i < navCount; i++) {
      const link = navLinks.nth(i);
      const ariaLabel = (await link.getAttribute('aria-label')) ?? `nav item ${i}`;
      await assertMinTouchTarget(link, `bottom nav: ${ariaLabel}`);
    }

    // Account menu trigger
    await assertMinTouchTarget(
      page.getByRole('button', { name: /account menu/i }),
      'app bar: account menu button',
    );

    // ── Settings tabs ─────────────────────────────────────────────────────────
    const settings = new SettingsPage(page);
    await settings.goto();

    await assertMinTouchTarget(page.getByTestId('tab-account'), 'settings: Account tab');
    await assertMinTouchTarget(page.getByTestId('tab-notifications'), 'settings: Notifications tab');
    await assertMinTouchTarget(page.getByTestId('tab-theme'), 'settings: Theme tab');

    // Theme toggle options — navigate directly and wait for the route to render.
    await page.goto('/settings/theme');
    await expect(page.getByTestId('theme-tab')).toBeVisible({ timeout: 8000 });
    await assertMinTouchTarget(page.getByTestId('theme-option-system'), 'theme: system option');
    await assertMinTouchTarget(page.getByTestId('theme-option-light'), 'theme: light option');
    await assertMinTouchTarget(page.getByTestId('theme-option-dark'), 'theme: dark option');
  });
});
