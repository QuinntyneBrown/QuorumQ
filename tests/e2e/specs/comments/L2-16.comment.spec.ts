import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { SessionPage } from '../../pages/sessions/session.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const BOB_EMAIL = 'bob@example.com';
const BOB_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
const RESTAURANT = 'Pizza Palace';

async function signIn(page: Page, email: string, password: string): Promise<void> {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn({ email, password });
  await expect(page).toHaveURL(/teams/);
}

async function setupSession(request: APIRequestContext, page: Page, email: string, password: string) {
  const session = await createSessionInState(request, ALICE_TEAM_ID);
  await signIn(page, email, password);
  await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
  const form = new SuggestionFormPage(page);
  await form.suggestRestaurant({ name: RESTAURANT });
  const sessionPage = new SessionPage(page);
  await sessionPage.openThread(RESTAURANT);
  return session;
}

test.describe('Comments on suggestions (L2-16)', () => {
  test('[L2-16] 1–500 char comment appears for all members in real time, attributed to the author', async ({ browser, request }) => {
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

      const aliceForm = new SuggestionFormPage(alicePage);
      await aliceForm.suggestRestaurant({ name: RESTAURANT });

      const aliceSession = new SessionPage(alicePage);
      const bobSession = new SessionPage(bobPage);

      await aliceSession.openThread(RESTAURANT);
      await bobSession.openThread(RESTAURANT);

      await aliceSession.postComment('Great choice for lunch!');

      // Bob sees the comment in real time
      await expect(bobPage.getByTestId('comment-body-0')).toBeVisible({ timeout: 2000 });
      await expect(bobPage.getByTestId('comment-body-0')).toContainText('Great choice for lunch!');

      // Comment attributed to Alice
      await expect(alicePage.getByText('alice', { exact: false })).toBeVisible();
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-16] author edits within 5 minutes; comment displays "edited"', async ({ page, request }) => {
    const session = await setupSession(request, page, ALICE_EMAIL, ALICE_PASSWORD);

    try {
      const sessionPage = new SessionPage(page);
      await sessionPage.postComment('Original comment text');

      await expect(page.getByTestId('comment-body-0')).toBeVisible({ timeout: 3000 });

      await sessionPage.editComment(0, 'Updated comment text');

      await expect(page.getByTestId('comment-body-0')).toContainText('Updated comment text', { timeout: 3000 });
      await expect(page.getByTestId('edited-badge')).toBeVisible();
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-16] author deletes their comment; thread shows "Comment deleted"', async ({ page, request }) => {
    const session = await setupSession(request, page, ALICE_EMAIL, ALICE_PASSWORD);

    try {
      const sessionPage = new SessionPage(page);
      await sessionPage.postComment('Comment to be deleted');

      await expect(page.getByTestId('comment-body-0')).toBeVisible({ timeout: 3000 });

      await sessionPage.deleteComment(0);

      await expect(page.getByTestId('comment-deleted-placeholder')).toBeVisible({ timeout: 3000 });
      await expect(page.getByTestId('comment-deleted-placeholder')).toContainText('Comment deleted');
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
