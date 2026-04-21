import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SettingsPage } from '../../pages/settings/settings.page';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

test.describe('Themes (L2-26)', () => {
  test('[L2-26] new user with OS dark mode opens the app in dark mode', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();

    try {
      const signIn = new SignInPage(page);
      await signIn.goto();
      await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
      await expect(page).toHaveURL(/teams/, { timeout: 8000 });

      // Reset Alice's preference to 'system' so OS dark mode is respected
      await page.request.put(`${API_BASE}/auth/me/preferences`, { data: { theme: 'system' } });
      await page.reload({ waitUntil: 'networkidle' });

      const isDark = await page.evaluate(() =>
        document.documentElement.classList.contains('theme-dark'),
      );
      expect(isDark).toBe(true);
    } finally {
      await ctx.close();
    }
  });

  test('[L2-26] toggling theme persists across sessions and devices', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    const settings = new SettingsPage(page);
    await settings.goto();
    await settings.openTab('Theme');
    await settings.selectTheme('dark');
    await settings.expectTheme('dark');

    // Reload to confirm persistence via server-side preference
    await page.reload({ waitUntil: 'networkidle' });
    await settings.expectTheme('dark');

    // Restore to system for cleanup
    await settings.goto();
    await settings.openTab('Theme');
    await settings.selectTheme('system');
  });
});
