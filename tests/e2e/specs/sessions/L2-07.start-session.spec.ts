import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { StartSessionPage } from '../../pages/sessions/start-session.page';
import { SessionPage } from '../../pages/sessions/session.page';
import { TeamDashboardPage } from '../../pages/teams/team-dashboard.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

test.describe('Start lunch session (L2-07)', () => {
  async function signInAsAlice(page: Parameters<typeof SignInPage>[0]): Promise<void> {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/);
  }

  test('[L2-07] team member starts a lunch session with a 45-minute deadline and it becomes visible on the dashboard', async ({ page, request }) => {
    await signInAsAlice(page);

    const startPage = new StartSessionPage(page);
    await startPage.goto(ALICE_TEAM_ID);
    await startPage.expectDeadlineHint();

    await startPage.startLunch();
    await expect(page).toHaveURL(/\/teams\/.+\/sessions\/.+/);

    const sessionMatch = page.url().match(/\/sessions\/([^/]+)$/);
    const sessionId = sessionMatch?.[1] ?? '';

    try {
      const sessionPage = new SessionPage(page);
      await sessionPage.expectSessionCard();
      await sessionPage.expectState('Suggesting');

      const dashboard = new TeamDashboardPage(page);
      await dashboard.goto(ALICE_TEAM_ID);
      await dashboard.expectActiveSessionCard();
    } finally {
      await deleteSession(request, sessionId);
    }
  });

  test('[L2-07] starting a lunch when an active one exists routes to the existing session', async ({ page, request }) => {
    await signInAsAlice(page);

    const existing = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      const startPage = new StartSessionPage(page);
      await startPage.goto(ALICE_TEAM_ID);
      await startPage.startLunch();

      await startPage.expectRedirectedToExisting();
      await expect(page).toHaveURL(new RegExp(existing.id));
    } finally {
      await deleteSession(request, existing.id);
    }
  });

  test('[L2-07] deadline under 5 min or over 180 min is rejected inline', async ({ page }) => {
    await signInAsAlice(page);

    const startPage = new StartSessionPage(page);
    await startPage.goto(ALICE_TEAM_ID);

    await page.route(`**/teams/${ALICE_TEAM_ID}/sessions`, async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: { deadlineMinutes: ['Deadline must be between 5 and 180 minutes.'] },
        }),
      });
    });

    await startPage.startLunch();
    await startPage.expectValidationError();
  });
});
