import { test, expect } from '@playwright/test';
import { SignUpPage } from '../../pages/auth/sign-up.page';

test.describe('L2-04 Sign up', () => {
  test('[L2-04] visitor submits valid email and strong password → account created, verification email noted', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.goto();

    const email = `signup-${Date.now()}@test.local`;
    await signUp.fillEmail(email);
    await signUp.fillPassword('S3cur3P@ssword!');
    await signUp.fillDisplayName('Test User');
    await signUp.submit();

    await expect(page).toHaveURL('/auth/verify-email-sent');
    await expect(page.getByTestId('verify-email-sent')).toBeVisible();
  });

  test('[L2-04] weak password submission is blocked by the strength meter', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.goto();

    await signUp.fillEmail('weak@test.local');
    await signUp.fillPassword('weak');
    await signUp.fillDisplayName('Test User');
    await signUp.submit();

    await expect(page).toHaveURL('/auth/sign-up');
    await signUp.expectValidationError('password', 'at least 10 characters');
  });

  test('[L2-04] unverified user is prompted to verify before creating a team', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.goto();

    const email = `unverified-${Date.now()}@test.local`;
    await signUp.fillEmail(email);
    await signUp.fillPassword('S3cur3P@ssword!');
    await signUp.fillDisplayName('Unverified User');
    await signUp.submit();

    await expect(page).toHaveURL('/auth/verify-email-sent');

    await page.goto('/teams');
    await expect(page.getByTestId('verify-email-banner')).toBeVisible();
  });
});
