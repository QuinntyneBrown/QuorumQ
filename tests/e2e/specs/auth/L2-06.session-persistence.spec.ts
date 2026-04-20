import { test, expect, BrowserContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { createUnverifiedUser } from '../../fixtures/auth.fixture';

const EMAIL = `e2e-persist-${Date.now()}@test.local`;
const PASSWORD = 'Str0ng!Pass99';

test.describe('Session persistence', () => {
  test.beforeAll(async () => {
    await createUnverifiedUser(EMAIL, PASSWORD, 'Persist User');
  });

  async function signInAndSaveState(context: BrowserContext): Promise<string> {
    const page = await context.newPage();
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: EMAIL, password: PASSWORD });
    await expect(page).toHaveURL(/teams/);
    const state = await context.storageState();
    await page.close();
    return JSON.stringify(state);
  }

  test('[L2-06] signed-in user remains signed in after page reload', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: EMAIL, password: PASSWORD });
    await expect(page).toHaveURL(/teams/);

    await page.reload();

    await expect(page).not.toHaveURL(/sign-in/);
    await signIn.expectAccountMenuVisible();
  });

  test('[L2-06] closing and reopening the browser keeps the user signed in within session lifetime', async ({ browser }) => {
    const context = await browser.newContext();
    await signInAndSaveState(context);
    await context.close();

    const state = await (async () => {
      const ctx2 = await browser.newContext();
      const st = await signInAndSaveState(ctx2);
      await ctx2.close();
      return JSON.parse(st);
    })();

    const ctx3 = await browser.newContext({ storageState: state });
    const page = await ctx3.newPage();
    await page.goto('/teams');

    await expect(page).not.toHaveURL(/sign-in/);
    await ctx3.close();
  });

  test('[L2-06] expired session prompts re-auth and resumes at the original route', async ({ page, context }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: EMAIL, password: PASSWORD });
    await expect(page).toHaveURL(/teams/);

    await context.clearCookies();
    await page.goto('/teams');

    await expect(page).toHaveURL(/sign-in/);
    await expect(page).toHaveURL(/return=/);
  });
});
