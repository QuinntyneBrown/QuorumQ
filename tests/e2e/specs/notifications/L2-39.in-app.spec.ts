import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
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

test.describe('In-app notifications (L2-39)', () => {
  test('[L2-39] member not on the session sees a toast with deep link when a session starts', async ({ page, request }) => {
    // Sign in and go to team dashboard (not on session page)
    await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
    await page.goto(`/teams/${ALICE_TEAM_ID}`);
    await expect(page.getByTestId('team-dashboard')).toBeVisible({ timeout: 4000 });

    // Wait for hub to connect
    await page.waitForTimeout(1000);

    // Create a session via API (simulates another user starting a session)
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      // Toast should appear
      const toast = page.locator('.qq-snack').first();
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast).toContainText('Lunch started');
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-39] member not on the session sees a toast when the session is decided', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Notification Test Grill' });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

      // Navigate away from session before it decides
      await page.goto(`/teams/${ALICE_TEAM_ID}`);

      // Wait for hub to connect to team notifications
      await page.waitForTimeout(1000);

      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);

      // Toast should appear for the decided event
      const toast = page.locator('.qq-snack').first();
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast).toContainText('Winner');
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-39] member on the session sees the 5-minute milestone inline, not as a toast', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Five Min Test Cafe' });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

      // Advance time to trigger 5-minute warning via _test endpoint
      await request.post(`${API_BASE}/_test/advance-five-min?sessionId=${session.id}`);
      await page.waitForTimeout(8000);

      // Inline banner should appear
      await expect(page.getByTestId('five-minute-banner')).toBeVisible({ timeout: 5000 });

      // No toast should appear (since we're on the session page)
      await expect(page.locator('.qq-snack')).not.toBeVisible();
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
