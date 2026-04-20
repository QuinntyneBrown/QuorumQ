import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { TeamDashboardPage } from '../../pages/teams/team-dashboard.page';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

test.describe('Team dashboard active session (L2-09)', () => {
  async function signInAsAlice(page: Parameters<typeof SignInPage>[0]): Promise<void> {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/);
  }

  async function createActiveSession(page: Parameters<typeof SignInPage>[0]): Promise<string> {
    const res = await page.request.post(
      `${API_BASE}/teams/${ALICE_TEAM_ID}/sessions`,
      {
        data: { deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString() },
        failOnStatusCode: false,
      },
    );
    if (res.status() === 201) {
      const body = await res.json();
      return body.id as string;
    }
    return '';
  }

  async function deleteActiveSession(page: Parameters<typeof SignInPage>[0], sessionId: string): Promise<void> {
    if (!sessionId) return;
    await page.request.delete(`${API_BASE}/sessions/${sessionId}`).catch(() => {});
  }

  test('[L2-09] dashboard without an active session surfaces a primary "Start lunch" action', async ({ page }) => {
    await signInAsAlice(page);

    const dashboard = new TeamDashboardPage(page);
    await dashboard.goto(ALICE_TEAM_ID);

    await dashboard.expectStartLunchCta();
    await expect(page.getByTestId('active-session-card')).not.toBeVisible();
  });

  test('[L2-09] dashboard shows active session card as first above-the-fold element at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await signInAsAlice(page);

    const sessionId = await createActiveSession(page);

    try {
      const dashboard = new TeamDashboardPage(page);
      await dashboard.goto(ALICE_TEAM_ID);

      await dashboard.expectActiveSessionCard();
      await expect(page.getByTestId('start-lunch-btn')).not.toBeVisible();

      const card = page.getByTestId('active-session-card');
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeLessThan(812);
    } finally {
      await deleteActiveSession(page, sessionId);
    }
  });
});
