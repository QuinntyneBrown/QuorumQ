import { test, expect } from '@playwright/test';
import { SignUpPage } from '../../pages/auth/sign-up.page';

const VALID_EMAIL = `e2e-signup-${Date.now()}@test.local`;
const STRONG_PASSWORD = 'Str0ng!Pass99';
const DISPLAY_NAME = 'E2E Tester';

test.describe('Sign-up', () => {
  test('[L2-04] visitor submits valid email and strong password → account created, verification email noted', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.goto();

    await signUp.fillDisplayName(DISPLAY_NAME);
    await signUp.fillEmail(VALID_EMAIL);
    await signUp.fillPassword(STRONG_PASSWORD);
    await signUp.submit();

    await expect(page).toHaveURL(/verify-email-sent/);
    await expect(page.getByText(/check your inbox/i)).toBeVisible();
  });

  test('[L2-04] weak password submission is blocked by the strength meter', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.goto();

    await signUp.fillDisplayName(DISPLAY_NAME);
    await signUp.fillEmail(`weak-${Date.now()}@test.local`);
    await signUp.fillPassword('short');

    await signUp.expectPasswordRule('At least 10 characters', false);
    await signUp.expectPasswordRule('One uppercase letter', false);
    await signUp.expectSubmitDisabled();

    await page.getByTestId('submit-button').click({ force: true });
    await expect(page).toHaveURL(/sign-up/);
  });

  test('[L2-04] unverified user is prompted to verify before creating a team', async ({ page }) => {
    const email = `unverified-${Date.now()}@test.local`;

    const signUp = new SignUpPage(page);
    await signUp.goto();
    await signUp.fillDisplayName('Unverified User');
    await signUp.fillEmail(email);
    await signUp.fillPassword(STRONG_PASSWORD);
    await signUp.submit();

    await expect(page).toHaveURL(/verify-email-sent/);
    await expect(page.getByText(/check your inbox/i)).toBeVisible();
  });
});
