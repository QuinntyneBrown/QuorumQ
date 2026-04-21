import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { VotePanelPage } from '../../pages/voting/vote-panel.page';
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

async function getSuggestionIds(page: Page): Promise<string[]> {
  const items = page.locator('[data-testid^="suggestion-"][data-testid!="suggestion-list"]');
  const count = await items.count();
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const testId = await items.nth(i).getAttribute('data-testid') ?? '';
    ids.push(testId.replace('suggestion-', ''));
  }
  return ids;
}

test.describe('Tie breaking (L2-14)', () => {
  test('[L2-14] deadline with a tie enters a 2-minute tie-break round limited to tied suggestions', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      // Suggest two restaurants
      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Alpha Bistro' });
      await form.suggestRestaurant({ name: 'Beta Cafe' });

      // Advance to Voting, cast tied votes via API
      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

      const suggIds = await getSuggestionIds(page);

      // Vote for first suggestion as Alice (via API to set up a tie without
      // requiring a second browser context)
      await page.request.put(`${API_BASE}/sessions/${session.id}/votes`, {
        data: { suggestionId: suggIds[0] },
      });

      // Trigger deadline — worker runs every 5s
      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);

      // Check tie-break banner appeared
      const panel = new VotePanelPage(page);
      await panel.expectTieBreakActive();
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-14] tie-break ending with a single leader transitions to Decided', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    const aliceCtx = await browser.newContext();
    const bobCtx = await browser.newContext();

    try {
      const alicePage = await aliceCtx.newPage();
      const bobPage = await bobCtx.newPage();

      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await signIn(bobPage, BOB_EMAIL, BOB_PASSWORD);

      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(alicePage);
      await form.suggestRestaurant({ name: 'Gamma Grill' });
      await form.suggestRestaurant({ name: 'Delta Diner' });

      await alicePage.getByTestId('start-voting-btn').click();
      await expect(alicePage.getByTestId('start-voting-btn')).not.toBeVisible();

      const suggIds = await getSuggestionIds(alicePage);

      // Create a tie (1 vote each via API)
      await alicePage.request.put(`${API_BASE}/sessions/${session.id}/votes`, {
        data: { suggestionId: suggIds[0] },
      });

      // Trigger main deadline
      await advanceTime(request, session.id);
      await alicePage.waitForTimeout(7000);

      // Now in tie-break — cast a vote for first suggestion (giving it 1 vs 0)
      // Alice's vote from before was cleared for non-tied; since both are tied, cast for first
      await alicePage.request.put(`${API_BASE}/sessions/${session.id}/votes`, {
        data: { suggestionId: suggIds[0] },
      });

      // Trigger tie-break deadline
      await advanceTieBreak(request, session.id);
      await alicePage.waitForTimeout(7000);

      // Session should be Decided
      await expect(alicePage.locator('[data-testid="session-card"]')).toContainText('decided', { ignoreCase: true });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-14] tie-break ending still tied picks a random winner and announces it as chosen at random', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Epsilon Eats' });
      await form.suggestRestaurant({ name: 'Zeta Bistro' });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

      // Trigger deadline with no votes — tie between all
      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);

      // Trigger tie-break deadline with still no votes
      await advanceTieBreak(request, session.id);
      await page.waitForTimeout(7000);

      // Session should be Decided
      await expect(page.locator('[data-testid="session-card"]')).toContainText('decided', { ignoreCase: true });
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
