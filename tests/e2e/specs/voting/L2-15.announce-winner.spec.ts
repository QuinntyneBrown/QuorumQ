import { test, expect, APIRequestContext } from '@playwright/test';
import { WinnerRevealPage } from '../../pages/sessions/winner-reveal.page';
import { deleteSession } from '../../fixtures/session.fixture';

test.describe.configure({ mode: 'serial' });

const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';
const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const BOB_EMAIL = 'bob@example.com';
const BOB_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

async function signInViaApi(request: APIRequestContext, email: string, password: string): Promise<void> {
  await request.post(`${API_BASE}/auth/sign-in`, { data: { email, password } });
}

interface SessionSetup {
  sessionId: string;
  s1Id: string;
}

async function setupWinnerSession(
  aliceRequest: APIRequestContext,
  opts: { name?: string; address?: string; websiteUrl?: string } = {},
): Promise<SessionSetup> {
  const sessionRes = await aliceRequest.post(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions`, {
    data: { deadlineMinutes: 30 },
    failOnStatusCode: false,
  });
  const session = await sessionRes.json();

  const s1Res = await aliceRequest.post(`${API_BASE}/sessions/${session.id}/suggestions`, {
    data: {
      name: opts.name ?? 'Taco Town',
      ...(opts.address ? { address: opts.address } : {}),
      ...(opts.websiteUrl ? { websiteUrl: opts.websiteUrl } : {}),
    },
  });
  const s1 = await s1Res.json();

  await aliceRequest.post(`${API_BASE}/sessions/${session.id}/start-voting`);
  await aliceRequest.put(`${API_BASE}/sessions/${session.id}/votes`, { data: { suggestionId: s1.id } });

  return { sessionId: session.id, s1Id: s1.id };
}

test.describe('Winner reveal (L2-15)', () => {
  test('[L2-15] all members see the animated winner reveal within 2 seconds of transition to Decided', async ({ browser, request }) => {
    await signInViaApi(request, ALICE_EMAIL, ALICE_PASSWORD);

    const bobCtx = await browser.newContext();
    await signInViaApi(bobCtx.request, BOB_EMAIL, BOB_PASSWORD);

    const { sessionId } = await setupWinnerSession(request);

    const aliceCtx = await browser.newContext();
    const aliceCookies = (await request.storageState()).cookies.filter(c => c.name === '.QuorumQ.Auth');
    if (aliceCookies.length > 0) await aliceCtx.addCookies(aliceCookies);

    const bobBrowserCtx = await browser.newContext();
    const bobCookies = (await bobCtx.request.storageState()).cookies.filter(c => c.name === '.QuorumQ.Auth');
    if (bobCookies.length > 0) await bobBrowserCtx.addCookies(bobCookies);

    const alicePage = await aliceCtx.newPage();
    const bobPage = await bobBrowserCtx.newPage();

    try {
      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}`);
      await expect(alicePage.getByTestId('session-card')).toBeVisible();

      await bobPage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}`);
      await expect(bobPage.getByTestId('session-card')).toBeVisible();

      // Expire the voting deadline
      await request.post(`${API_BASE}/_test/advance-time?sessionId=${sessionId}`);

      // Both members should navigate to winner reveal within reasonable time (worker up to 5s + 2s render)
      const winnerPath = new RegExp(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}/winner`);
      await alicePage.waitForURL(winnerPath, { timeout: 15000 });
      await bobPage.waitForURL(winnerPath, { timeout: 15000 });

      // Winner reveal should be visible within 2 seconds of navigation
      const aliceReveal = new WinnerRevealPage(alicePage);
      await aliceReveal.expectWinnerRevealWithin(2000);

      const bobReveal = new WinnerRevealPage(bobPage);
      await bobReveal.expectWinnerRevealWithin(2000);
    } finally {
      await aliceCtx.close();
      await bobBrowserCtx.close();
      await bobCtx.close();
      await deleteSession(request, sessionId);
    }
  });

  test('[L2-15] reveal shows "Get directions" and "Open website" actions when available', async ({ browser, request }) => {
    await signInViaApi(request, ALICE_EMAIL, ALICE_PASSWORD);

    const { sessionId } = await setupWinnerSession(request, {
      name: 'Directions Diner',
      address: '123 Main St, Springfield',
      websiteUrl: 'https://directionsdiner.example.com',
    });

    const aliceCtx = await browser.newContext();
    const aliceCookies = (await request.storageState()).cookies.filter(c => c.name === '.QuorumQ.Auth');
    if (aliceCookies.length > 0) await aliceCtx.addCookies(aliceCookies);

    const alicePage = await aliceCtx.newPage();

    try {
      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}`);
      await expect(alicePage.getByTestId('session-card')).toBeVisible();

      await request.post(`${API_BASE}/_test/advance-time?sessionId=${sessionId}`);

      const winnerPath = new RegExp(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}/winner`);
      await alicePage.waitForURL(winnerPath, { timeout: 15000 });

      const revealPage = new WinnerRevealPage(alicePage);
      await revealPage.expectWinnerRevealWithin(2000);
      await revealPage.expectDirectionsLink();
      await revealPage.expectWebsiteLink();
    } finally {
      await aliceCtx.close();
      await deleteSession(request, sessionId);
    }
  });

  test('[L2-15] winner chosen at random displays the random-choice chip', async ({ browser, request }) => {
    await signInViaApi(request, ALICE_EMAIL, ALICE_PASSWORD);

    const bobCtx = await browser.newContext();
    await signInViaApi(bobCtx.request, BOB_EMAIL, BOB_PASSWORD);

    // Create tied session (same as L2-14 setup)
    const sessionRes = await request.post(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions`, {
      data: { deadlineMinutes: 30 },
      failOnStatusCode: false,
    });
    const session = await sessionRes.json();

    const s1Res = await request.post(`${API_BASE}/sessions/${session.id}/suggestions`, {
      data: { name: 'Burger Barn 2' },
    });
    const s1 = await s1Res.json();

    const s2Res = await request.post(`${API_BASE}/sessions/${session.id}/suggestions`, {
      data: { name: 'Pizza Palace 2' },
    });
    const s2 = await s2Res.json();

    await request.post(`${API_BASE}/sessions/${session.id}/start-voting`);
    await request.put(`${API_BASE}/sessions/${session.id}/votes`, { data: { suggestionId: s1.id } });
    await bobCtx.request.put(`${API_BASE}/sessions/${session.id}/votes`, { data: { suggestionId: s2.id } });

    const aliceCtx = await browser.newContext();
    const aliceCookies = (await request.storageState()).cookies.filter(c => c.name === '.QuorumQ.Auth');
    if (aliceCookies.length > 0) await aliceCtx.addCookies(aliceCookies);

    const alicePage = await aliceCtx.newPage();

    try {
      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}`);
      await expect(alicePage.getByTestId('session-card')).toBeVisible();

      // Enter tie-break
      await request.post(`${API_BASE}/_test/advance-time?sessionId=${session.id}`);
      await expect(alicePage.getByTestId('tie-break-banner')).toBeVisible({ timeout: 15000 });

      // Expire tie-break with still-tied votes (no new votes)
      await request.post(`${API_BASE}/_test/advance-tie-break?sessionId=${session.id}`);

      const winnerPath = new RegExp(`/teams/${ALICE_TEAM_ID}/sessions/${session.id}/winner`);
      await alicePage.waitForURL(winnerPath, { timeout: 15000 });

      const revealPage = new WinnerRevealPage(alicePage);
      await revealPage.expectWinnerRevealWithin(2000);
      await revealPage.expectRandomChoiceChip();
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, session.id);
    }
  });
});
