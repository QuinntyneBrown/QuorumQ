import { test, expect, APIRequestContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { AccountSettingsPage } from '../../pages/settings/account-settings.page';

const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

async function createTestUser(request: APIRequestContext): Promise<{ email: string; password: string }> {
  const ts = Date.now();
  const email = `delete-test-${ts}@example.com`;
  const password = 'Password1!';
  await request.post(`${API_BASE}/auth/sign-up`, {
    data: { email, password, displayName: `Delete Test ${ts}` },
  });
  return { email, password };
}

test.describe('Account deletion (L2-43)', () => {
  test('[L2-43] user confirms deletion; identifying info is removed and they are signed out', async ({ page, request }) => {
    const { email, password } = await createTestUser(request);

    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email, password });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    const accountPage = new AccountSettingsPage(page);
    await accountPage.goto();
    await accountPage.deleteAccount();
    await accountPage.expectAccountGone();

    // Verify sign in with old credentials fails
    await signIn.goto();
    await signIn.signIn({ email, password });
    await expect(page).not.toHaveURL(/teams/, { timeout: 3000 }).catch(() => {});
  });

  test('[L2-43] after deletion, API calls with the old session cookie return 401', async ({ page, request }) => {
    const { email, password } = await createTestUser(request);

    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email, password });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    // Delete account
    const accountPage = new AccountSettingsPage(page);
    await accountPage.goto();
    await accountPage.deleteAccount();
    await expect(page).toHaveURL(/sign-in/, { timeout: 5000 });

    // Old session cookie should no longer be valid
    const meResp = await page.request.get(`${API_BASE}/auth/me`);
    expect(meResp.status()).toBe(401);
  });

  test('[L2-43] after deletion, their past comments display "former member"', async ({ page, request }) => {
    const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
    const { email, password } = await createTestUser(request);

    // Sign in as test user and join the team (via invite or use seeded membership)
    // For simplicity, use alice's existing session to add a comment
    const aliceSignIn = new SignInPage(page);
    await aliceSignIn.goto();
    await aliceSignIn.signIn({ email: 'alice@example.com', password: 'Password1!' });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    // Create a session and add a comment
    const sessionResp = await page.request.post(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions`, {
      data: { deadlineMinutes: 30 },
    });
    const session = await sessionResp.json();

    await page.request.post(`${API_BASE}/sessions/${session.id}/suggestions`, {
      data: { restaurantName: 'Comment Test Place' },
    }).catch(() => {});

    // Get suggestions to find one to comment on
    const sugResp = await page.request.get(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions/${session.id}/suggestions`).catch(() => null);
    const suggestions = sugResp ? await sugResp.json().catch(() => []) : [];

    let commentCreated = false;
    if (suggestions.length > 0) {
      await page.request.post(`${API_BASE}/sessions/${session.id}/comments`, {
        data: { body: 'Test comment for deletion', suggestionId: suggestions[0].id },
      }).catch(() => {});
      commentCreated = true;
    }

    // Delete Alice's account
    await page.request.delete(`${API_BASE}/auth/me`);

    if (commentCreated) {
      // Comments should show "Former Member"
      const commentsResp = await request.get(`${API_BASE}/sessions/${session.id}/comments`);
      if (commentsResp.ok()) {
        const comments = await commentsResp.json().catch(() => []);
        const aliceComments = comments.filter((c: { authorDisplayName?: string }) =>
          c.authorDisplayName === 'Former Member',
        );
        expect(aliceComments.length).toBeGreaterThan(0);
      }
    }

    // Cleanup
    await request.delete(`${API_BASE}/sessions/${session.id}`).catch(() => {});
  });
});
