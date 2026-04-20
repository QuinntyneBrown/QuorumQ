import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SessionPage } from '../../pages/sessions/session.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

test.describe('Session states (L2-08)', () => {
  async function signInAsAlice(page: Parameters<typeof SignInPage>[0]): Promise<void> {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/);
  }

  test('[L2-08] organizer transitions Suggesting → Voting and suggestions lock', async ({ page, request }) => {
    await signInAsAlice(page);

    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      const sessionPage = new SessionPage(page);
      await sessionPage.goto(ALICE_TEAM_ID, session.id);
      await sessionPage.expectState('Suggesting');
      await sessionPage.expectStartVotingButton();

      await sessionPage.tapStartVoting();

      await sessionPage.expectState('Voting');
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-08] deadline passing transitions Voting → Decided and announces the winner', async ({ page, request }) => {
    await signInAsAlice(page);

    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      // Move to Voting first
      await request.post(`${API_BASE}/sessions/${session.id}/start-voting`);

      // Advance time past deadline
      await request.post(`${API_BASE}/_test/advance-time?sessionId=${session.id}`);

      // Wait for background worker (max 6 seconds)
      const sessionPage = new SessionPage(page);
      await sessionPage.goto(ALICE_TEAM_ID, session.id);

      await expect(async () => {
        await page.reload();
        await sessionPage.expectState('Decided');
      }).toPass({ timeout: 8000 });
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-08] organizer cancels an active session and it becomes read-only', async ({ page, request }) => {
    await signInAsAlice(page);

    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      const sessionPage = new SessionPage(page);
      await sessionPage.goto(ALICE_TEAM_ID, session.id);
      await sessionPage.expectCancelButton();

      await sessionPage.cancelSession();

      await sessionPage.expectState('Cancelled');
      await sessionPage.expectCancelledBanner();
      await expect(page.getByTestId('cancel-session-btn')).not.toBeVisible();
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
