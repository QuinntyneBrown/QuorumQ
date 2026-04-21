import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { RestaurantProfilePage } from '../../pages/restaurants/restaurant-profile.page';
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

async function advanceTime(request: APIRequestContext, sessionId: string): Promise<void> {
  await request.post(`${API_BASE}/_test/advance-time?sessionId=${sessionId}`);
}

async function setupDecidedSession(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ sessionId: string }> {
  const session = await createSessionInState(request, ALICE_TEAM_ID);
  await signIn(page, email, password);
  await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

  const form = new SuggestionFormPage(page);
  await form.suggestRestaurant({ name: 'Review Bistro' });

  await page.getByTestId('start-voting-btn').click();
  await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();

  await advanceTime(request, session.id);
  await page.waitForTimeout(7000);

  await expect(page).toHaveURL(/winner/, { timeout: 4000 });
  return { sessionId: session.id };
}

test.describe('Reviews (L2-17)', () => {
  test('[L2-17] participating member submits 1–5 star rating; average updates', async ({ page, request }) => {
    const { sessionId } = await setupDecidedSession(page, request, ALICE_EMAIL, ALICE_PASSWORD);

    try {
      await expect(page.getByTestId('review-form')).toBeVisible({ timeout: 3000 });

      const reviewPage = new RestaurantProfilePage(page);
      await reviewPage.leaveReview(4, 'Fantastic place!');

      await reviewPage.expectAverageRating(4);
    } finally {
      await deleteSession(request, sessionId);
    }
  });

  test('[L2-17] re-submitting replaces the previous review for the same visit', async ({ page, request }) => {
    const { sessionId } = await setupDecidedSession(page, request, ALICE_EMAIL, ALICE_PASSWORD);

    try {
      const reviewPage = new RestaurantProfilePage(page);
      await reviewPage.leaveReview(3);

      await expect(page.getByTestId('submit-review-btn')).toContainText('Update review', { timeout: 2000 });

      await reviewPage.leaveReview(5);
      await reviewPage.expectAverageRating(5);
    } finally {
      await deleteSession(request, sessionId);
    }
  });

  test('[L2-17] non-participant does not see a review form', async ({ browser, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    const aliceCtx = await browser.newContext();
    const bobCtx = await browser.newContext();

    try {
      const alicePage = await aliceCtx.newPage();
      const bobPage = await bobCtx.newPage();

      await signIn(alicePage, ALICE_EMAIL, ALICE_PASSWORD);
      await signIn(bobPage, BOB_EMAIL, BOB_PASSWORD);

      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(alicePage);
      await form.suggestRestaurant({ name: 'Alice Only Bistro' });

      await alicePage.getByTestId('start-voting-btn').click();
      await expect(alicePage.getByTestId('start-voting-btn')).not.toBeVisible();

      await request.post(`${API_BASE}/_test/advance-time?sessionId=${session.id}`);
      await alicePage.waitForTimeout(7000);
      await expect(alicePage).toHaveURL(/winner/, { timeout: 4000 });

      // Bob navigates to the winner reveal
      await bobPage.goto(alicePage.url());
      await bobPage.waitForSelector('[data-testid="winner-reveal"]', { timeout: 5000 });

      // Bob is not a participant — should see unavailable message
      const bobReview = new RestaurantProfilePage(bobPage);
      await bobReview.expectReviewFormUnavailable();
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });
});
