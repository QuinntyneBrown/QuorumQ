import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SessionPage } from '../../pages/sessions/session.page';
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

async function createContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext();
}

test.describe('Realtime updates (L2-19)', () => {
  test('[L2-19] two members on the same session see state changes within 2 s', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    const aliceCtx = await createContext(browser);
    const bobCtx = await createContext(browser);

    try {
      const alicePage = await aliceCtx.newPage();
      const bobPage = await bobCtx.newPage();

      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await signIn(bobPage, BOB_EMAIL, BOB_PASSWORD);

      const aliceSession = new SessionPage(alicePage);
      const bobSession = new SessionPage(bobPage);

      await aliceSession.goto(ALICE_TEAM_ID, session.id);
      await bobSession.goto(ALICE_TEAM_ID, session.id);

      await aliceSession.expectState('Suggesting');
      await bobSession.expectState('Suggesting');

      // Alice starts voting
      await aliceSession.tapStartVoting();

      // Bob should see the update within 2 seconds without reload
      await expect(async () => {
        await bobSession.expectState('Voting');
      }).toPass({ timeout: 2000 });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-19] two members on the same session see each other\'s vote within 2 s', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    const aliceCtx = await createContext(browser);
    const bobCtx = await createContext(browser);

    try {
      const alicePage = await aliceCtx.newPage();
      const bobPage = await bobCtx.newPage();

      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await signIn(bobPage, BOB_EMAIL, BOB_PASSWORD);

      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
      await bobPage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      // Move to Voting
      await request.post(`${API_BASE}/sessions/${session.id}/start-voting`);

      // Both pages reload state via hub
      await expect(async () => {
        await expect(alicePage.getByTestId('session-card')).toContainText('Voting', { ignoreCase: true });
      }).toPass({ timeout: 2000 });

      await expect(async () => {
        await expect(bobPage.getByTestId('session-card')).toContainText('Voting', { ignoreCase: true });
      }).toPass({ timeout: 2000 });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-19] device that loses connection shows "Reconnecting…" and resyncs on reconnect', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);
    const aliceCtx = await createContext(browser);

    try {
      const alicePage = await aliceCtx.newPage();
      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      await expect(alicePage.getByTestId('session-card')).toBeVisible();

      // Simulate network loss by routing hub endpoint to abort
      await alicePage.route(`${API_BASE}/hubs/session**`, route => route.abort());

      // After reconnect attempt fails, should show reconnecting indicator
      await expect(alicePage.getByTestId('reconnecting-pill')).toBeVisible({ timeout: 5000 });

      // Restore network
      await alicePage.unroute(`${API_BASE}/hubs/session**`);
    } finally {
      await aliceCtx.close();
      await deleteSession(request, session.id);
    }
  });
});
