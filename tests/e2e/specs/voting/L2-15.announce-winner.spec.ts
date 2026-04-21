import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { WinnerRevealPageObject } from '../../pages/sessions/winner-reveal.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const BOB_EMAIL = 'bob@example.com';
const BOB_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

async function signIn(page: Page, email: string, password: string): Promise<void> {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn({ email, password });
  await expect(page).toHaveURL(/teams/);
}

async function advanceTime(request: APIRequestContext, sessionId: string): Promise<void> {
  await request.post(`${API_BASE}/_test/advance-time?sessionId=${sessionId}`);
}

async function advanceTieBreak(request: APIRequestContext, sessionId: string): Promise<void> {
  await request.post(`${API_BASE}/_test/advance-tiebreak?sessionId=${sessionId}`);
}

test.describe('Winner reveal (L2-15)', () => {
  test('[L2-15] all members see the animated winner reveal within 2 seconds of transition to Decided', async ({ browser, request }) => {
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

      const form = new SuggestionFormPage(alicePage);
      await form.suggestRestaurant({ name: 'Pizza Palace' });

      await alicePage.getByTestId('start-voting-btn').click();
      await expect(alicePage.getByTestId('start-voting-btn')).not.toBeVisible();

      // Advance time to trigger deadline with one suggestion (clear winner)
      await advanceTime(request, session.id);
      await alicePage.waitForTimeout(7000);

      // Both pages should navigate to winner reveal
      await expect(alicePage).toHaveURL(/winner/, { timeout: 4000 });
      await expect(bobPage).toHaveURL(/winner/, { timeout: 4000 });

      const aliceReveal = new WinnerRevealPageObject(alicePage);
      const bobReveal = new WinnerRevealPageObject(bobPage);

      await aliceReveal.expectWinnerRevealWithin(2000);
      await bobReveal.expectWinnerRevealWithin(2000);
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-15] reveal shows "Get directions" and "Open website" actions when available', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({
        name: 'Sushi Spot',
        address: '123 Main St, San Francisco, CA',
        websiteUrl: 'https://sushistop.example.com',
      });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);

      await expect(page).toHaveURL(/winner/, { timeout: 4000 });

      const reveal = new WinnerRevealPageObject(page);
      await reveal.expectWinnerRevealWithin(2000);
      await reveal.expectDirectionsLink();
      await reveal.expectWebsiteLink();
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-15] winner chosen at random displays the random-choice chip', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Alpha Bistro' });
      await form.suggestRestaurant({ name: 'Beta Cafe' });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

      // No votes — tie-break, then random
      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);

      await advanceTieBreak(request, session.id);
      await page.waitForTimeout(7000);

      await expect(page).toHaveURL(/winner/, { timeout: 4000 });

      const reveal = new WinnerRevealPageObject(page);
      await reveal.expectWinnerRevealWithin(2000);
      await reveal.expectRandomChoiceChip();
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
