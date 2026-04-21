import { test, expect, Browser, Page } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const BOB_EMAIL = 'bob@example.com';
const BOB_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

async function signIn(page: Page, email: string, password: string): Promise<void> {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn({ email, password });
  await expect(page).toHaveURL(/teams/);
}

test.describe('Withdraw suggestion (L2-12)', () => {
  test('[L2-12] author withdraws their suggestion during Suggesting and it disappears for all members', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    const aliceCtx = await browser.newContext();
    const bobCtx = await browser.newContext();

    try {
      const alicePage = await aliceCtx.newPage();
      const bobPage = await bobCtx.newPage();

      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await signIn(bobPage, BOB_EMAIL, BOB_PASSWORD);

      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
      await bobPage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const aliceForm = new SuggestionFormPage(alicePage);
      await aliceForm.suggestRestaurant({ name: 'Taco Town' });

      // Wait for suggestion to appear on both pages
      await expect(alicePage.getByText('Taco Town')).toBeVisible();
      await expect(async () => {
        await expect(bobPage.getByText('Taco Town')).toBeVisible();
      }).toPass({ timeout: 2000 });

      // Get the suggestion id from the DOM
      const suggestionItem = alicePage.locator('[data-testid^="suggestion-"]').first();
      const testId = await suggestionItem.getAttribute('data-testid') ?? '';
      const suggestionId = testId.replace('suggestion-', '');

      // Alice withdraws the suggestion
      await aliceForm.withdrawOwnSuggestion(suggestionId);

      // Disappears for Alice
      await expect(alicePage.getByText('Taco Town')).not.toBeVisible();

      // Disappears for Bob within 2 seconds
      await expect(async () => {
        await expect(bobPage.getByText('Taco Town')).not.toBeVisible();
      }).toPass({ timeout: 2000 });

      // Bob has no withdraw button for his own non-existent suggestion (list should be empty)
      await expect(bobPage.getByTestId('no-suggestions')).toBeVisible();
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-12] Withdraw action is unavailable once session enters Voting', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Sushi Palace' });
      await expect(page.getByText('Sushi Palace')).toBeVisible();

      const suggestionItem = page.locator('[data-testid^="suggestion-"]').first();
      const testId = await suggestionItem.getAttribute('data-testid') ?? '';
      const suggestionId = testId.replace('suggestion-', '');

      // Withdraw should be visible now (in Suggesting state)
      await expect(page.getByTestId(`withdraw-btn-${suggestionId}`)).toBeVisible();

      // Advance to Voting
      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

      // Withdraw button should be gone
      await form.expectNoWithdrawOption(suggestionId);
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-12] non-author does not see Withdraw button on another user suggestion', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    const aliceCtx = await browser.newContext();
    const bobCtx = await browser.newContext();

    try {
      const alicePage = await aliceCtx.newPage();
      const bobPage = await bobCtx.newPage();

      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await signIn(bobPage, BOB_EMAIL, BOB_PASSWORD);

      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
      await bobPage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const aliceForm = new SuggestionFormPage(alicePage);
      await aliceForm.suggestRestaurant({ name: 'Pizza Joint' });
      await expect(alicePage.getByText('Pizza Joint')).toBeVisible();

      // Wait for Bob to see the suggestion
      await expect(async () => {
        await expect(bobPage.getByText('Pizza Joint')).toBeVisible();
      }).toPass({ timeout: 2000 });

      const suggestionItem = bobPage.locator('[data-testid^="suggestion-"]').first();
      const testId = await suggestionItem.getAttribute('data-testid') ?? '';
      const suggestionId = testId.replace('suggestion-', '');

      // Bob should NOT see a withdraw button for Alice's suggestion
      const bobForm = new SuggestionFormPage(bobPage);
      await bobForm.expectNoWithdrawOption(suggestionId);
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });
});
