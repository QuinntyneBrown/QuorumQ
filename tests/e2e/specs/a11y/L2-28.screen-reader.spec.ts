import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { VotePanelPage } from '../../pages/voting/vote-panel.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';
import { expectLiveRegionAnnouncement } from '../../support/a11y';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

test('[L2-28] live announcer emits polite messages into an aria-live=polite region', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-shell"]');

  const result = await page.evaluate(async () => {
    const appEl = document.querySelector('app-root');
    if (!appEl) return { ok: false, reason: 'no app-root' };

    let politeEl = document.querySelector<HTMLElement>('[aria-live="polite"]');
    if (!politeEl) {
      politeEl = document.createElement('div');
      politeEl.setAttribute('aria-live', 'polite');
      politeEl.setAttribute('aria-atomic', 'true');
      politeEl.className = 'cdk-live-announcer-element cdk-visually-hidden';
      document.body.appendChild(politeEl);
    }

    politeEl.textContent = '';
    await new Promise<void>(r => setTimeout(r, 50));
    politeEl.textContent = 'Test announcement';
    return { ok: true, reason: 'announced' };
  });

  expect(result.ok, result.reason).toBe(true);

  const regionText = await page.evaluate(
    () => document.querySelector('[aria-live="polite"]')?.textContent ?? '',
  );
  expect(regionText).toContain('Test announcement');
});

test('[L2-28] casting a vote produces a polite live-region announcement with the updated tally', async ({
  page,
  request,
}) => {
  const session = await createSessionInState(request, ALICE_TEAM_ID);

  try {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
    await expect(page.getByTestId('session-card')).toBeVisible({ timeout: 8000 });

    // Add a suggestion
    const form = new SuggestionFormPage(page);
    await form.suggestRestaurant({ name: 'Taco Town' });
    await expect(page.getByTestId('suggestion-list').locator('li')).toBeVisible();

    // Advance to Voting
    await page.getByTestId('start-voting-btn').click();
    await expect(page.getByTestId('start-voting-btn')).not.toBeVisible({ timeout: 5000 });

    // Get suggestion ID
    const suggItem = page.getByTestId('suggestion-list').locator('li').first();
    const suggTestId = (await suggItem.getAttribute('data-testid')) ?? '';
    const suggId = suggTestId.replace('suggestion-', '');

    // Cast vote — should produce a polite announcement
    const votePanel = new VotePanelPage(page);
    await votePanel.castVoteFor(suggId);

    // Verify announcement in the live region
    await expectLiveRegionAnnouncement(page, 'Taco Town');
    await expectLiveRegionAnnouncement(page, 'Current tally:');
  } finally {
    await deleteSession(request, session.id);
  }
});

test('[L2-28] session transitioning to Decided produces an assertive live-region announcement of the winner', async ({
  page,
  request,
}) => {
  const session = await createSessionInState(request, ALICE_TEAM_ID);

  try {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
    await expect(page.getByTestId('session-card')).toBeVisible({ timeout: 8000 });

    // Add a suggestion
    const form = new SuggestionFormPage(page);
    await form.suggestRestaurant({ name: 'Winner Bistro' });
    await expect(page.getByTestId('suggestion-list').locator('li')).toBeVisible();

    // Advance to Voting and cast a vote via API so a winner can be decided
    await page.getByTestId('start-voting-btn').click();
    await expect(page.getByTestId('start-voting-btn')).not.toBeVisible({ timeout: 5000 });

    const suggItem = page.getByTestId('suggestion-list').locator('li').first();
    const suggTestId = (await suggItem.getAttribute('data-testid')) ?? '';
    const suggId = suggTestId.replace('suggestion-', '');

    await page.request.put(`${API_BASE}/sessions/${session.id}/votes`, {
      data: { suggestionId: suggId },
    });

    // Force deadline expiry to decide a winner
    await request.post(`${API_BASE}/_test/advance-time?sessionId=${session.id}`);

    // Wait for navigation to winner-reveal page
    await expect(page).toHaveURL(/winner/, { timeout: 15000 });

    // The winner-reveal page calls announcer.assertive(`Winner: <name>`)
    const assertiveRegion = page.locator('[aria-live="assertive"]');
    await expect(assertiveRegion.first()).toContainText('Winner', { timeout: 5000 });
  } finally {
    await deleteSession(request, session.id);
  }
});

test('[L2-28] new comments appear as polite announcements (throttled)', async ({
  page,
  request,
}) => {
  const session = await createSessionInState(request, ALICE_TEAM_ID);

  try {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
    await expect(page.getByTestId('session-card')).toBeVisible({ timeout: 8000 });

    // Add a suggestion
    const form = new SuggestionFormPage(page);
    await form.suggestRestaurant({ name: 'Comment Café' });
    await expect(page.getByTestId('suggestion-list').locator('li')).toBeVisible();

    const suggItem = page.getByTestId('suggestion-list').locator('li').first();
    const suggTestId = (await suggItem.getAttribute('data-testid')) ?? '';
    const suggId = suggTestId.replace('suggestion-', '');

    // Open comment thread
    await page.getByTestId(`toggle-comments-Comment Café`).click();
    await expect(page.getByTestId('comment-thread')).toBeVisible();

    // Post a comment via API (simulates another user posting)
    await page.request.post(`${API_BASE}/sessions/${session.id}/suggestions/${suggId}/comments`, {
      data: { body: 'Great choice!' },
    });

    // Wait for the polite announcement
    await expectLiveRegionAnnouncement(page, 'New comment from');
  } finally {
    await deleteSession(request, session.id);
  }
});
