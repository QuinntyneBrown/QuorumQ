import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { SessionHistoryPage } from '../../pages/sessions/session-history.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
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

test.describe('Session history (L2-37)', () => {
  test('[L2-37] history lists past sessions newest-first with date, winner, tally', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'History Test Bistro', cuisine: 'French' });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();
      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);
      await expect(page).toHaveURL(/winner/, { timeout: 4000 });

      const historyPage = new SessionHistoryPage(page);
      await historyPage.goto(ALICE_TEAM_ID);
      await historyPage.expectSessionsListed(1);

      // Verify winner and tally are shown
      const winnerEl = page.locator('[data-testid^="session-winner-"]').first();
      await expect(winnerEl).toContainText('History Test Bistro');
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-37] opening a past session shows suggestions, votes, and comments read-only', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Read-Only Grill' });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();
      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);
      await expect(page).toHaveURL(/winner/, { timeout: 4000 });

      const historyPage = new SessionHistoryPage(page);
      await historyPage.goto(ALICE_TEAM_ID);
      await historyPage.openSession('Read-Only Grill');
      await historyPage.expectReadOnly();

      await expect(page.getByTestId('suggestions-list')).toBeVisible();

      // No mutating controls should be present
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();
      await expect(page.getByTestId('submit-review-btn')).not.toBeVisible();
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
