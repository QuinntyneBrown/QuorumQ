import { test, expect, Page } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

async function signIn(page: Page): Promise<void> {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
  await expect(page).toHaveURL(/teams/);
}

test.describe('Reuse past restaurants (L2-11)', () => {
  test('[L2-11] typing 2 chars shows matching past restaurants within 300 ms', async ({ page, request }) => {
    // First session to plant the restaurant
    const s1 = await createSessionInState(request, ALICE_TEAM_ID);
    await signIn(page);
    await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${s1.id}`);
    const form = new SuggestionFormPage(page);
    await form.suggestRestaurant({ name: 'Pasta Palace', cuisine: 'Italian' });
    await expect(page.getByText('Pasta Palace')).toBeVisible();
    await deleteSession(request, s1.id);

    // Second session to test autocomplete
    const s2 = await createSessionInState(request, ALICE_TEAM_ID);
    try {
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${s2.id}`);
      const t0 = Date.now();
      await form.typeNameQuery('Pa');
      await form.expectAutocompleteOptions(['Pasta Palace']);
      expect(Date.now() - t0).toBeLessThan(300);
    } finally {
      await deleteSession(request, s2.id);
    }
  });

  test('[L2-11] selecting an autocomplete entry prefills name, cuisine, and address', async ({ page, request }) => {
    const s1 = await createSessionInState(request, ALICE_TEAM_ID);
    await signIn(page);
    await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${s1.id}`);
    const form = new SuggestionFormPage(page);
    await form.suggestRestaurant({ name: 'Sushi Spot', cuisine: 'Japanese', address: '123 Main St' });
    await expect(page.getByText('Sushi Spot')).toBeVisible();
    await deleteSession(request, s1.id);

    const s2 = await createSessionInState(request, ALICE_TEAM_ID);
    try {
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${s2.id}`);
      await form.typeNameQuery('Su');
      await form.expectAutocompleteOptions(['Sushi Spot']);
      await form.selectAutocomplete('Sushi Spot');

      // Cuisine and address should be prefilled
      await expect(page.getByTestId('cuisine-input')).toHaveValue('Japanese');
      await expect(page.getByTestId('address-input')).toHaveValue('123 Main St');
    } finally {
      await deleteSession(request, s2.id);
    }
  });
});
