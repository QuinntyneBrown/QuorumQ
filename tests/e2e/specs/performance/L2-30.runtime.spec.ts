import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { SuggestionFormPage } from '../../pages/suggestions/suggestion-form.page';
import { createSessionInState, deleteSession } from '../../fixtures/session.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

// INP/throttled tests require a production build. Set PERF_ENABLED=1 to run.
const PERF_ENABLED = !!process.env['PERF_ENABLED'];

const FEEDBACK_BUDGET_MS = 100;
const INP_BUDGET_MS = 50;

test.describe('Runtime responsiveness', () => {
  test('[L2-30] primary action provides visible feedback within 100 ms', async ({
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
      await form.suggestRestaurant({ name: 'Fast Feedback Cafe' });
      await expect(page.getByTestId('suggestion-list').locator('li')).toBeVisible();

      // Advance to Voting
      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible({ timeout: 5000 });

      const suggItem = page.getByTestId('suggestion-list').locator('li').first();
      const suggTestId = (await suggItem.getAttribute('data-testid')) ?? '';
      const suggId = suggTestId.replace('suggestion-', '');
      await expect(page.getByTestId(`vote-btn-${suggId}`)).toBeVisible();

      // Measure from inside the browser to avoid Playwright IPC overhead (~50–200 ms per roundtrip).
      // MutationObserver fires synchronously within the same task as the DOM update.
      const feedbackMs = await page.evaluate(
        (testId: string) =>
          new Promise<number>((resolve, reject) => {
            const btn = document.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
            if (!btn) { reject(new Error(`Button not found: ${testId}`)); return; }
            const obs = new MutationObserver(() => {
              const elapsed = performance.now() - t0;
              obs.disconnect();
              resolve(elapsed);
            });
            obs.observe(btn, { attributes: true, attributeFilter: ['aria-pressed'] });
            const t0 = performance.now();
            btn.click();
            setTimeout(() => { obs.disconnect(); reject(new Error('aria-pressed did not change within 200 ms')); }, 200);
          }),
        `vote-btn-${suggId}`,
      );

      expect(
        feedbackMs,
        `Vote button feedback took ${feedbackMs.toFixed(1)} ms — budget is ${FEEDBACK_BUDGET_MS} ms`,
      ).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS);
    } finally {
      await deleteSession(request, session.id);
    }
  });

  test('[L2-30] INP under 50 ms across typical interactions on throttled mobile', async ({
    page,
    browserName,
    request,
  }) => {
    if (!PERF_ENABLED) {
      test.skip(true, 'Set PERF_ENABLED=1 to run INP tests against a production build');
      return;
    }
    test.skip(browserName !== 'chromium', 'CDP-based INP measurement requires Chromium');

    const session = await createSessionInState(request, ALICE_TEAM_ID);

    try {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (9 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
        latency: 170,
      });
      await cdp.send('Network.enable', {});

      // Inject interaction event recorder before navigation
      await page.addInitScript(() => {
        (window as Record<string, unknown>)['__inpEntries'] = [];
        const obs = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            (window as Record<string, unknown[]>)['__inpEntries'].push({
              duration: (entry as PerformanceEntry & { duration: number }).duration,
              name: entry.name,
            });
          }
        });
        obs.observe({ type: 'event', buffered: true, durationThreshold: 0 } as PerformanceObserverInit);
      });

      const signIn = new SignInPage(page);
      await signIn.goto();
      await signIn.signIn({ email: ALICE_EMAIL, password: ALICE_PASSWORD });
      await expect(page).toHaveURL(/teams/, { timeout: 8000 });

      await page.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
      await expect(page.getByTestId('session-card')).toBeVisible({ timeout: 8000 });

      // Interaction 1: suggest a restaurant (type in form + submit)
      const form = new SuggestionFormPage(page);
      await form.suggestRestaurant({ name: 'INP Bistro' });
      await expect(page.getByTestId('suggestion-list').locator('li')).toBeVisible();

      // Advance to Voting
      await page.getByTestId('start-voting-btn').click();
      await expect(page.getByTestId('start-voting-btn')).not.toBeVisible({ timeout: 5000 });

      const suggItem = page.getByTestId('suggestion-list').locator('li').first();
      const suggTestId = (await suggItem.getAttribute('data-testid')) ?? '';
      const suggId = suggTestId.replace('suggestion-', '');
      const voteBtn = page.getByTestId(`vote-btn-${suggId}`);

      // Interaction 2: cast a vote
      await voteBtn.click();
      await expect(voteBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 2000 });

      await cdp.detach();

      // Measure collected INP entries
      const entries = await page.evaluate(
        () => (window as Record<string, unknown>)['__inpEntries'] as Array<{ duration: number; name: string }>,
      );

      // Filter to pointer/click interaction events only (exclude continuous pointer-move etc.)
      const clickEvents = entries.filter(e => e.name === 'pointerup' || e.name === 'click');
      for (const entry of clickEvents) {
        expect(
          entry.duration,
          `INP event "${entry.name}" took ${entry.duration.toFixed(0)} ms — budget is ${INP_BUDGET_MS} ms`,
        ).toBeLessThanOrEqual(INP_BUDGET_MS);
      }
    } finally {
      await deleteSession(request, session.id);
    }
  });
});
