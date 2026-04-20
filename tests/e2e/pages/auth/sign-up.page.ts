import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class SignUpPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/sign-up');
  }

  async fillDisplayName(name: string): Promise<void> {
    await this.page.getByTestId('display-name-input').fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByTestId('email-input').fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByTestId('password-input').fill(password);
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('submit-button').click();
  }

  async expectValidationError(field: 'displayName' | 'email' | 'password', message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.page.getByTestId('submit-button')).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.page.getByTestId('submit-button')).not.toBeDisabled();
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
