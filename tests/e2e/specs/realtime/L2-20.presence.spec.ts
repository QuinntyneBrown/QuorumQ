import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { PresenceComponent } from '../../pages/components/presence.component';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const BOB_EMAIL = 'bob@example.com';
const BOB_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
const ALICE_ID = '11111111-0000-0000-0000-000000000001';
const BOB_ID = '11111111-0000-0000-0000-000000000002';

async function signIn(page: Page, email: string, password: string): Promise<void> {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn({ email, password });
  await expect(page).toHaveURL(/teams/);
}

test.describe('Presence (L2-20)', () => {
  test('[L2-20] members present on the session appear as avatars with an online indicator', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    const aliceCtx = await browser.newContext();
    const bobCtx = await browser.newContext();

    try {
      const alicePage = await aliceCtx.newPage();
      const bobPage = await bobCtx.newPage();

      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await signIn(bobPage, BOB_EMAIL, BOB_PASSWORD);

      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
      await bobPage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      // Both users should appear as present on each other's screen
      const alicePresence = new PresenceComponent(alicePage);
      const bobPresence = new PresenceComponent(bobPage);

      await expect(async () => {
        await alicePresence.expectPresenceRow();
      }).toPass({ timeout: 3000 });

      await expect(async () => {
        await bobPresence.expectPresenceRow();
      }).toPass({ timeout: 3000 });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-20] when a member closes the session screen their avatar is cleared within 30 s', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    const aliceCtx = await browser.newContext();
    const bobCtx = await browser.newContext();

    try {
      const alicePage = await aliceCtx.newPage();
      const bobPage = await bobCtx.newPage();

      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await signIn(bobPage, BOB_EMAIL, BOB_PASSWORD);

      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
      await bobPage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const alicePresence = new PresenceComponent(alicePage);
      await expect(async () => {
        await alicePresence.expectPresenceRow();
      }).toPass({ timeout: 3000 });

      // Bob navigates away
      await bobPage.goto('/teams');

      // Alice should see Bob's avatar clear within 30 seconds
      await expect(async () => {
        await expect(alicePage.getByTestId(`presence-user-${BOB_ID}`)).not.toBeVisible();
      }).toPass({ timeout: 35000 });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });
});
