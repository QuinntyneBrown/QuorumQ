import { test, expect, APIRequestContext } from '@playwright/test';
import { VotePanelPage } from '../../pages/voting/vote-panel.page';
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
  s2Id: string;
}

async function setupTiedSession(aliceRequest: APIRequestContext, bobRequest: APIRequestContext): Promise<SessionSetup> {
  // Create session
  const sessionRes = await aliceRequest.post(`${API_BASE}/teams/${ALICE_TEAM_ID}/sessions`, {
    data: { deadlineMinutes: 30 },
    failOnStatusCode: false,
  });
  const session = await sessionRes.json();

  // Add two suggestions
  const s1Res = await aliceRequest.post(`${API_BASE}/sessions/${session.id}/suggestions`, {
    data: { name: 'Burger Barn' },
  });
  const s1 = await s1Res.json();

  const s2Res = await aliceRequest.post(`${API_BASE}/sessions/${session.id}/suggestions`, {
    data: { name: 'Pizza Palace' },
  });
  const s2 = await s2Res.json();

  // Transition to Voting
  await aliceRequest.post(`${API_BASE}/sessions/${session.id}/start-voting`);

  // Cast tied votes: Alice votes for s1, Bob votes for s2
  await aliceRequest.put(`${API_BASE}/sessions/${session.id}/votes`, { data: { suggestionId: s1.id } });
  await bobRequest.put(`${API_BASE}/sessions/${session.id}/votes`, { data: { suggestionId: s2.id } });

  return { sessionId: session.id, s1Id: s1.id, s2Id: s2.id };
}

test.describe('Tie breaking (L2-14)', () => {
  test('[L2-14] deadline with a tie enters a 2-minute tie-break round limited to tied suggestions', async ({ browser, request }) => {
    await signInViaApi(request, ALICE_EMAIL, ALICE_PASSWORD);

    const bobCtx = await browser.newContext();
    await signInViaApi(bobCtx.request, BOB_EMAIL, BOB_PASSWORD);

    const { sessionId, s1Id, s2Id } = await setupTiedSession(request, bobCtx.request);

    const aliceCtx = await browser.newContext();
    const alicePage = await aliceCtx.newPage();
    const aliceCookies = (await request.storageState()).cookies.filter(c => c.name === '.QuorumQ.Auth');
    if (aliceCookies.length > 0) await aliceCtx.addCookies(aliceCookies);

    try {
      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}`);
      await expect(alicePage.getByTestId('session-card')).toBeVisible();

      // Expire the voting deadline
      await request.post(`${API_BASE}/_test/advance-time?sessionId=${sessionId}`);

      // Tie-break banner should appear (worker fires every 5s)
      const votePanel = new VotePanelPage(alicePage);
      await votePanel.expectTieBreakActive();

      // Only tied suggestions should have vote buttons
      await votePanel.expectOnlyTiedVotable([s1Id, s2Id]);
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, sessionId);
    }
  });

  test('[L2-14] tie-break ending with a single leader transitions to Decided', async ({ browser, request }) => {
    await signInViaApi(request, ALICE_EMAIL, ALICE_PASSWORD);

    const bobCtx = await browser.newContext();
    await signInViaApi(bobCtx.request, BOB_EMAIL, BOB_PASSWORD);

    const { sessionId, s1Id } = await setupTiedSession(request, bobCtx.request);

    const aliceCtx = await browser.newContext();
    const alicePage = await aliceCtx.newPage();
    const aliceCookies = (await request.storageState()).cookies.filter(c => c.name === '.QuorumQ.Auth');
    if (aliceCookies.length > 0) await aliceCtx.addCookies(aliceCookies);

    try {
      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}`);
      await expect(alicePage.getByTestId('session-card')).toBeVisible();

      // Enter tie-break
      await request.post(`${API_BASE}/_test/advance-time?sessionId=${sessionId}`);
      const votePanel = new VotePanelPage(alicePage);
      await votePanel.expectTieBreakActive();

      // Alice switches her vote to s1 — now s1 leads 2 vs 0 (Bob's vote was for s2, but non-tied votes
      // were cleared; Alice's vote was for s1 which stays; Bob re-votes if needed)
      // In tie-break, both s1 and s2 are tied. Alice's original vote for s1 remains.
      // Bob's vote for s2 remains. We need Alice to change her vote to s1 again, or Bob to s1.
      // Let's have Bob switch to s1 to create a clear leader.
      await bobCtx.request.put(`${API_BASE}/sessions/${sessionId}/votes`, { data: { suggestionId: s1Id } });

      // Expire tie-break
      await request.post(`${API_BASE}/_test/advance-tie-break?sessionId=${sessionId}`);

      // Session should transition to Decided
      await expect(alicePage.getByTestId('session-card')).toContainText('Decided', { ignoreCase: true, timeout: 15000 });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, sessionId);
    }
  });

  test('[L2-14] tie-break ending still tied picks a random winner and announces it as chosen at random', async ({ browser, request }) => {
    await signInViaApi(request, ALICE_EMAIL, ALICE_PASSWORD);

    const bobCtx = await browser.newContext();
    await signInViaApi(bobCtx.request, BOB_EMAIL, BOB_PASSWORD);

    const { sessionId } = await setupTiedSession(request, bobCtx.request);

    const aliceCtx = await browser.newContext();
    const alicePage = await aliceCtx.newPage();
    const aliceCookies = (await request.storageState()).cookies.filter(c => c.name === '.QuorumQ.Auth');
    if (aliceCookies.length > 0) await aliceCtx.addCookies(aliceCookies);

    try {
      await alicePage.goto(`/teams/${ALICE_TEAM_ID}/sessions/${sessionId}`);
      await expect(alicePage.getByTestId('session-card')).toBeVisible();

      // Enter tie-break
      await request.post(`${API_BASE}/_test/advance-time?sessionId=${sessionId}`);
      const votePanel = new VotePanelPage(alicePage);
      await votePanel.expectTieBreakActive();

      // Don't cast any new votes — expire tie-break with still-tied votes
      await request.post(`${API_BASE}/_test/advance-tie-break?sessionId=${sessionId}`);

      // Session should transition to Decided with "chosen at random" indicator
      await expect(alicePage.getByTestId('session-card')).toContainText('Decided', { ignoreCase: true, timeout: 15000 });
      await expect(alicePage.getByTestId('winner-chosen-at-random')).toBeVisible({ timeout: 5000 });
    } finally {
      await aliceCtx.close();
      await bobCtx.close();
      await deleteSession(request, sessionId);
    }
  });
});
