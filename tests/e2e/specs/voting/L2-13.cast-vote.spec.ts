import { test, expect, Page } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { VotePanelPage } from '../../pages/voting/vote-panel.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const BOB_EMAIL = 'bob@example.com';
const BOB_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

async function signIn(page: Page, email: string, password: string): Promise<void> {
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.signIn({ email, password });
  await expect(page).toHaveURL(/teams/);
}

async function advanceToVoting(page: Page): Promise<void> {
  await page.getByTestId('start-voting-btn').click();
  await expect(page.getByTestId('start-voting-btn')).not.toBeVisible();
}

async function getSuggestionId(page: Page): Promise<string> {
  const item = page.locator('[data-testid^="suggestion-"][data-testid!="suggestion-list"]').first();
  const testId = await item.getAttribute('data-testid') ?? '';
  return testId.replace('suggestion-', '');
}

test.describe('Cast a vote (L2-13)', () => {
  test('[L2-13] member casts a vote in Voting state; tally updates for all members in real time', async ({ browser, request }) => {
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

      // Alice suggests a restaurant
      const aliceForm = new SuggestionFormPage(alicePage);
      await aliceForm.suggestRestaurant({ name: 'Sushi Spot' });
      await expect(alicePage.getByText('Sushi Spot')).toBeVisible();

      // Advance to Voting
      await advanceToVoting(alicePage);

      const suggestionId = await getSuggestionId(alicePage);
      const alicePanel = new VotePanelPage(alicePage);
      const bobPanel = new VotePanelPage(bobPage);

      // Alice casts a vote
      await alicePanel.castVoteFor(suggestionId);

      // Alice sees youVoted state
      await alicePanel.expectYouVoted(suggestionId);
      await alicePanel.expectVoteCount(suggestionId, 1);

      // Bob sees the tally update within 2 seconds
      await expect(async () => {
        await bobPanel.expectVoteCount(suggestionId, 1);
      }).toPass({ timeout: 2000 });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });

  test('[L2-13] tapping a different suggestion moves the vote and decrements the previous tally', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Burger King' });
      await form.suggestRestaurant({ name: 'Taco Bell' });

      await advanceToVoting(page);

      const items = page.locator('[data-testid^="suggestion-"][data-testid!="suggestion-list"]');
      const firstId = (await items.nth(0).getAttribute('data-testid') ?? '').replace('suggestion-', '');
      const secondId = (await items.nth(1).getAttribute('data-testid') ?? '').replace('suggestion-', '');

      const panel = new VotePanelPage(page);

      // Vote for first
      await panel.castVoteFor(firstId);
      await panel.expectVoteCount(firstId, 1);
      await panel.expectVoteCount(secondId, 0);

      // Move vote to second
      await panel.castVoteFor(secondId);
      await panel.expectVoteCount(firstId, 0);
      await panel.expectVoteCount(secondId, 1);
      await panel.expectYouVoted(secondId);
      await panel.expectNotVoted(firstId);
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-13] tapping the current vote clears it', async ({ page, request }) => {
    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      await signIn(page, ALICE_EMAIL, ALICE_PASSWORD);
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);

      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'Pizza Place' });

      await advanceToVoting(page);

      const suggestionId = await getSuggestionId(page);
      const panel = new VotePanelPage(page);

      // Cast vote
      await panel.castVoteFor(suggestionId);
      await panel.expectVoteCount(suggestionId, 1);
      await panel.expectYouVoted(suggestionId);

      // Tap again to clear
      await panel.castVoteFor(suggestionId);
      await panel.expectVoteCount(suggestionId, 0);
      await panel.expectNotVoted(suggestionId);
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
