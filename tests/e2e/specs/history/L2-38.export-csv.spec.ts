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

test.describe('Export CSV (L2-38)', () => {
  test('[L2-38] Owner taps Export CSV and downloads a file containing date, winner, tally, participants', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'CSV Bistro', cuisine: 'French' });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();
      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);
      await expect(page).toHaveURL(/winner/, { timeout: 4000 });

      const historyPage = new SessionHistoryPage(page);
      await historyPage.goto(ALICE_TEAM_ID);

      // Owner should see the export button
      await expect(page.getByTestId('export-csv-btn')).toBeVisible({ timeout: 3000 });

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByTestId('export-csv-btn').click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/\.csv$/);

      const content = await download.createReadStream();
      let csvText = '';
      for await (const chunk of content) {
        csvText += chunk.toString();
      }

      expect(csvText).toContain('date,winner,cuisine,tally,participants');
      expect(csvText).toContain('CSV Bistro');
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-38] Non-owner does not see Export CSV', async ({ page, request }) => {
    // Bob is a Member on Alice's team (seeded in test data)
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn({ email: 'bob@example.com', password: 'Password1!' });
    await expect(page).toHaveURL(/teams/);

    await page.goto(`/teams/${ALICE_TEAM_ID}/history`);
    await expect(page.getByTestId('session-history')).toBeVisible({ timeout: 4000 });

    await expect(page.getByTestId('export-csv-btn')).not.toBeVisible();
  });
});
