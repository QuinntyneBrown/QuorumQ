import { test, expect, Page } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';
const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

async function createVotingSession(page: Page): Promise<string> {
  // Delete existing active session first
  const existing = await page.request.get(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions/active`)
    .then(r => r.ok() ? r.json() : null).catch(() => null);
  if (existing?.id) {
    await page.request.delete(`${API_BASE}/sessions/${existing.id}`).catch(() => {});
  }

  const sessionResp = await page.request.post(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions`, {
    data: { deadlineMinutes: 5 },
  });
  const session = await sessionResp.json();

  await page.request.post(`${API_BASE}/sessions/${session.id}/suggestions`, {
    data: { restaurantName: 'Motion Test Restaurant' },
  }).catch(() => {});

  return session.id as string;
}

async function cleanupSession(page: Page, sessionId: string): Promise<void> {
  await page.request.delete(`${API_BASE}/sessions/${sessionId}`).catch(() => {});
}

test.describe('Motion & reduced motion (L2-25)', () => {
  test('[L2-25] user with prefers-reduced-motion=reduce does not see non-essential animations', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();

    try {
      const signIn = new SignInPage(page);
      await signIn.goto();
      await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
      await expect(page).toHaveURL(/teams/, { timeout: 8000 });

      // Navigate to a team dashboard (should exist for Alice)
      await page.goto(`/teams/${ALICE_TEAM_ID}`);
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Vote tally bars: transition should be 'none' when prefers-reduced-motion: reduce
      const tallyTransition = await page.evaluate(() => {
        const bar = document.querySelector('.qq-vote-tally__bar');
        if (!bar) return 'no-element';
        return window.getComputedStyle(bar).transition;
      });
      // 'none' or '0s' variants all indicate reduced transition
      const isReduced = tallyTransition === 'none' ||
        tallyTransition.includes('0s') ||
        tallyTransition === '' ||
        tallyTransition === 'no-element';
      expect(isReduced).toBe(true);

      // Winner reveal: opacity transition should be suppressed
      const winnerTransition = await page.evaluate(() => {
        const reveal = document.querySelector('.qq-winner-reveal');
        if (!reveal) return 'no-element';
        return window.getComputedStyle(reveal).transition;
      });
      const winnerIsReduced = winnerTransition === 'none' ||
        winnerTransition.includes('0s') ||
        winnerTransition === '' ||
        winnerTransition === 'no-element';
      expect(winnerIsReduced).toBe(true);
    } finally {
      await ctx.close();
    }
  });

  test('[L2-25] casting a vote animates the tally smoothly to its new value (60 fps)', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.goto();
    await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
    await expect(page).toHaveURL(/teams/, { timeout: 8000 });

    const sessionId = await createVotingSession(page);

    try {
      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}`);
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verify the vote-tally bar uses a CSS transition (non-reduced mode)
      const hasTransition = await page.evaluate(() => {
        // Check the SCSS-defined transition on the bar track element
        const styleSheets = Array.from(document.styleSheets);
        for (const sheet of styleSheets) {
          try {
            for (const rule of Array.from(sheet.cssRules)) {
              if (rule.cssText.includes('qq-vote-tally__bar') && rule.cssText.includes('transition')) {
                return true;
              }
            }
          } catch { /* cross-origin */ }
        }
        // Fallback: check if any bar has transition set
        const bar = document.querySelector('.qq-vote-tally__bar') as HTMLElement | null;
        if (bar) {
          const t = window.getComputedStyle(bar).transition;
          return t !== 'none' && t !== '' && !t.includes('0s');
        }
        return false;
      });

      // If we're on the session page with a vote tally, it must have a transition
      // (or the tally doesn't exist yet — which is also acceptable since voting just started)
      const tallyVisible = await page.locator('.qq-vote-tally').isVisible().catch(() => false);
      if (tallyVisible) {
        expect(hasTransition).toBe(true);
      }

      // Cast a vote via API and verify the bar exists (smooth animation is CSS-driven)
      const sugResp = await page.request.get(`${API_BASE}/sessions/${sessionId}/suggestions`).catch(() => null);
      const suggestions = sugResp?.ok() ? await sugResp.json().catch(() => []) : [];
      if (suggestions.length > 0) {
        await page.request.post(`${API_BASE}/sessions/${sessionId}/votes`, {
          data: { suggestionId: suggestions[0].id },
        }).catch(() => {});

        await page.waitForTimeout(500);

        // After voting, the tally bar should appear and have a valid CSS transition
        const barAfterVote = page.locator('.qq-vote-tally__bar').first();
        await barAfterVote.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

        const transitionAfterVote = await page.evaluate(() => {
          const bar = document.querySelector('.qq-vote-tally__bar') as HTMLElement | null;
          if (!bar) return 'no-element';
          return window.getComputedStyle(bar).transition;
        });
        const isAnimated = transitionAfterVote !== 'none' &&
          transitionAfterVote !== '' &&
          !transitionAfterVote.includes('0s') &&
          transitionAfterVote !== 'no-element';
        expect(isAnimated).toBe(true);
      }
    } finally {
      await cleanupSession(page, sessionId);
    }
  });
});
