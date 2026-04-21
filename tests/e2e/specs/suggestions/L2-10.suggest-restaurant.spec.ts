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

test.describe('Suggest a restaurant (L2-10)', () => {
  test('[L2-10] member submits a restaurant during Suggesting and all members see it in real time', async ({ browser, request }) => {
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
      await aliceForm.suggestRestaurant({ name: 'The Noodle Bar', cuisine: 'Asian' });

      // Alice sees it in her list
      await expect(alicePage.getByTestId('suggestion-list')).toBeVisible();
      await expect(alicePage.getByText('The Noodle Bar')).toBeVisible();

      // Bob sees it within 2 seconds (L2-19 real-time regression guard)
      await expect(async () => {
        await expect(bobPage.getByText('The Noodle Bar')).toBeVisible();
      }).toPass({ timeout: 2000 });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-10] duplicate name triggers an "Already suggested" message with an upvote CTA', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Burger House' });
      await expect(page.getByText('Burger House')).toBeVisible();

      // Suggest the same restaurant again (case-insensitive)
      await form.suggestRestaurant({ name: 'burger house' });
      await form.expectAlreadySuggested('Alice Demo');
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-10] suggestion form is disabled when session is not in Suggesting state', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      // Advance to Voting state
      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

      // Expand the suggestion panel
      await page.getByTestId('suggest-panel').click();

      const form = new SuggestionFormPage(page);
      await form.expectFormDisabled();
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
