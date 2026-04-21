import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { RestaurantProfilePage } from '../../pages/restaurants/restaurant-profile.page';
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

test.describe('Restaurant profile (L2-18)', () => {
  test('[L2-18] tapping a restaurant opens the profile with details, average rating, and reviews', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({
        name: 'Profile Test Cafe',
        cuisine: 'Mediterranean',
      });

      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();
      await advanceTime(request, session.id);
      await page.waitForTimeout(7000);
      await expect(page).toHaveURL(/winner/, { timeout: 4000 });

      // Leave a review from winner reveal
      const revealReview = new RestaurantProfilePage(page);
      await revealReview.leaveReview(4, 'Great atmosphere!');

      // Click restaurant name link in winner reveal (navigate to profile)
      await page.getByTestId('restaurant-name-link').click();
      await expect(page).toHaveURL(/restaurants/, { timeout: 4000 });

      await expect(page.getByTestId('restaurant-profile')).toBeVisible();
      await expect(page.getByTestId('restaurant-name')).toContainText('Profile Test Cafe');

      const profilePage = new RestaurantProfilePage(page);
      await profilePage.expectAverageRating(4);
      await profilePage.expectReviewCount(1);
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-18] restaurant with no reviews shows an empty state with a CTA', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Empty State Diner' });

      // Navigate directly to the suggestion's restaurant profile via the link
      const nameLink = page.getByTestId('restaurant-name');
      await expect(nameLink).toBeVisible({ timeout: 3000 });

      // Get the href from the link
      const href = await nameLink.getAttribute('href');
      if (href) {
        await page.goto(href);
      } else {
        await nameLink.click();
      }

      await expect(page).toHaveURL(/restaurants/, { timeout: 4000 });
      await expect(page.getByTestId('restaurant-profile')).toBeVisible();

      const profilePage = new RestaurantProfilePage(page);
      await profilePage.expectEmptyState();
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
