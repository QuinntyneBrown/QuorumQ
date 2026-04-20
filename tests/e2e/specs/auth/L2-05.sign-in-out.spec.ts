import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SignUpPage } from '../../pages/auth/sign-up.page';
import { createUnverifiedUser } from '../../fixtures/auth.fixture';

const EMAIL = `e2e-signin-${Date.now()}@test.local`;
const PASSWORD = 'Str0ng!Pass99';
const DISPLAY = 'E2E SignIn';

test.describe('Sign-in / sign-out', () => {
  test.beforeAll(async () => {
    await createUnverifiedUser(EMAIL, PASSWORD, DISPLAY);
  });

  test('[L2-05] registered user signs in and lands on their last active team', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: EMAIL, password: PASSWORD });

    await expect(page).toHaveURL(/teams/);
    await signIn.expectAccountMenuVisible();
  });

  test('[L2-05] signing out clears the session and returns to sign-in', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: EMAIL, password: PASSWORD });
    await expect(page).toHaveURL(/teams/);

    await page.getByRole('button', { name: /account menu/i }).click();
    await page.getByTestId('sign-out-button').click();

    await expect(page).toHaveURL(/sign-in/);
  });

  test('[L2-05] three rapid failed sign-ins surface a rate-limit message', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();

    for (let i = 0; i < 5; i++) {
      await signIn.signIn({ email: EMAIL, password: 'WrongPass1!' });
    }

    await signIn.expectRateLimited();
    await expect(page.getByTestId('submit-button')).toBeDisabled();
  });
});
