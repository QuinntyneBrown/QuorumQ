import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class SignInPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(returnUrl?: string): Promise<void> {
    const url = returnUrl
      ? `/auth/sign-in?return=${encodeURIComponent(returnUrl)}`
      : '/auth/sign-in';
    await this.page.goto(url);
  }

  async signIn({ email, password }: { email: string; password: string }): Promise<void> {
    await this.page.getByTestId('email-input').fill(email);
    await this.page.getByTestId('password-input').fill(password);
    await this.page.getByTestId('submit-button').locator('button').click();
  }

  async expectRateLimited(retryAfterSeconds?: number): Promise<void> {
    const banner = this.page.getByTestId('rate-limit-message');
    await expect(banner).toBeVisible();
    if (retryAfterSeconds !== undefined) {
      await expect(banner).toContainText(String(retryAfterSeconds));
    }
  }

  async expectAccountMenuVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: /account menu/i })).toBeVisible();
  }

  async returnsToRouteAfterReauth(route: string, email: string, password: string): Promise<void> {
    await expect(this.page).toHaveURL(/sign-in/);
    await expect(this.page).toHaveURL(new RegExp(`return=.*${encodeURIComponent(route)}`));
    await this.signIn({ email, password });
    await expect(this.page).toHaveURL(new RegExp(route.replace(/\//g, '\\/')));
  }
}
