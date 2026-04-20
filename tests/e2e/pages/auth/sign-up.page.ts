import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class SignUpPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/sign-up');
    await this.page.waitForSelector('[data-testid="sign-up-form"]');
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByTestId('email-input').fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByTestId('password-input').fill(password);
  }

  async fillDisplayName(name: string): Promise<void> {
    await this.page.getByTestId('display-name-input').fill(name);
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Create account' }).click();
  }

  async expectValidationError(field: string, message: string): Promise<void> {
    await expect(this.page.getByTestId(`${field}-error`)).toContainText(message);
  }

  async expectServerError(message: string): Promise<void> {
    await expect(this.page.getByTestId('server-error')).toContainText(message);
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Create account' })).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Create account' })).not.toBeDisabled();
  }

  async expectPasswordRule(rule: string, met: boolean): Promise<void> {
    const item = this.page.locator('.pw-rules li').filter({ hasText: rule });
    if (met) {
      await expect(item).toHaveClass(/met/);
    } else {
      await expect(item).not.toHaveClass(/met/);
    }
  }
}
