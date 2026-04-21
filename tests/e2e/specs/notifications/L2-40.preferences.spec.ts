import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { NotificationSettingsPage } from '../../pages/settings/notification-settings.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

async function signIn(page: import('@playwright/test').Page): Promise<void> {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
  await expect(page).toHaveURL(/teams/, { timeout: 8000 });
}

test.describe('Notification preferences (L2-40)', () => {
  test('[L2-40] user disables notifications for a team; subsequent events produce no toasts for that team', async ({ page, request }) => {
    await signIn(page);

    const notifSettings = new NotificationSettingsPage(page);
    await notifSettings.goto();

    // Mute the team
    await notifSettings.muteTeam(ALICE_TEAM_ID);
    await notifSettings.expectMuted(ALICE_TEAM_ID, true);

    // Go to team dashboard
    await page.goto(`/teams/${ALICE_TEAM_ID}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Delete any active session first, then create a new one
    const dashResp = await page.request.get(`${API_BASE}/teams/${ALICE_TEAM_ID}/dashboard`);
    const dash = await dashResp.json();
    if (dash.activeSession) {
      await page.request.delete(`${API_BASE}/sessions/${dash.activeSession.id}`);
    }

    await page.request.post(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions`, {
      data: { deadlineMinutes: 30 },
    });

    // Wait a bit — no toast should appear
    await page.waitForTimeout(4000);
    await expect(page.locator('.qq-snack')).not.toBeVisible();

    // Cleanup: unmute and delete the session
    await page.request.put(`${API_BASE}/notification-preferences/${ALICE_TEAM_ID}`, { data: { muted: false } });
    const dash2Resp = await page.request.get(`${API_BASE}/teams/${ALICE_TEAM_ID}/dashboard`);
    const dash2 = await dash2Resp.json();
    if (dash2.activeSession) {
      await page.request.delete(`${API_BASE}/sessions/${dash2.activeSession.id}`);
    }
  });

  test('[L2-40] re-enabling notifications restores delivery', async ({ page, request }) => {
    await signIn(page);

    const notifSettings = new NotificationSettingsPage(page);
    await notifSettings.goto();

    // Ensure unmuted
    await notifSettings.unmuteTeam(ALICE_TEAM_ID);
    await notifSettings.expectMuted(ALICE_TEAM_ID, false);

    // Go to team dashboard and wait for hub
    await page.goto(`/teams/${ALICE_TEAM_ID}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Delete any active session
    const dashResp = await page.request.get(`${API_BASE}/teams/${ALICE_TEAM_ID}/dashboard`);
    const dash = await dashResp.json();
    if (dash.activeSession) {
      await page.request.delete(`${API_BASE}/sessions/${dash.activeSession.id}`);
    }

    // Create new session
    await page.request.post(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions`, {
      data: { deadlineMinutes: 30 },
    });

    // Toast SHOULD appear
    await expect(page.locator('.qq-snack')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.qq-snack')).toContainText('Lunch started');

    // Cleanup
    const dash2Resp = await page.request.get(`${API_BASE}/teams/${ALICE_TEAM_ID}/dashboard`);
    const dash2 = await dash2Resp.json();
    if (dash2.activeSession) {
      await page.request.delete(`${API_BASE}/sessions/${dash2.activeSession.id}`);
    }
  });
});
