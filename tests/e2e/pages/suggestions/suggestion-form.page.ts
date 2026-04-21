import { Page, expect } from '@playwright/test';

interface SuggestOptions {
  name: string;
  cuisine?: string;
  address?: string;
  websiteUrl?: string;
}

export class SuggestionFormPage {
  constructor(private readonly page: Page) {}

  async suggestRestaurant(opts: SuggestOptions): Promise<void> {
    await this.page.getByTestId('suggest-panel').click();
    await this.page.getByTestId('name-input').fill(opts.name);
    if (opts.cuisine) await this.page.getByTestId('cuisine-input').fill(opts.cuisine);
    if (opts.address) await this.page.getByTestId('address-input').fill(opts.address);
    if (opts.websiteUrl) await this.page.getByTestId('website-input').fill(opts.websiteUrl);
    await this.page.getByTestId('submit-suggestion-btn').click();
  }

  async expectAlreadySuggested(by: string): Promise<void> {
    await expect(this.page.getByTestId('duplicate-banner')).toContainText(`Already suggested by ${by}`);
    await expect(this.page.getByTestId('upvote-cta')).toBeVisible();
  }

  async expectFormDisabled(): Promise<void> {
    await expect(this.page.getByTestId('form-disabled-msg')).toBeVisible();
  }

  async typeNameQuery(q: string): Promise<void> {
    await this.page.getByTestId('suggest-panel').click();
    await this.page.getByTestId('name-input').fill(q);
  }

  async expectAutocompleteOptions(names: string[]): Promise<void> {
    for (const name of names) {
      await expect(this.page.locator('mat-option').filter({ hasText: name })).toBeVisible();
    }
  }

  async selectAutocomplete(name: string): Promise<void> {
    await this.page.locator('mat-option').filter({ hasText: name }).click();
  }

  async withdrawOwnSuggestion(suggestionId: string): Promise<void> {
    await this.page.getByTestId(`withdraw-btn-${suggestionId}`).click();
    await this.page.getByRole('button', { name: 'Withdraw' }).click();
  }

  async expectNoWithdrawOption(suggestionId: string): Promise<void> {
    await expect(this.page.getByTestId(`withdraw-btn-${suggestionId}`)).not.toBeVisible();
  }
}
