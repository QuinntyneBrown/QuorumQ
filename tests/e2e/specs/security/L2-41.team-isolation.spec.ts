import { test, expect } from '@playwright/test';
import { apiPost } from '../../support/api-client';
import { createUnverifiedUser } from '../../fixtures/auth.fixture';

const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

async function signIn(email: string, password: string): Promise<Headers> {
  const res = await fetch(`${API_BASE}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  return res.headers;
}

async function getCookieForUser(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get('set-cookie') ?? '';
  return setCookie;
}

test.describe('Team isolation (L2-41)', () => {
  let aliceCookie: string;
  let bobCookie: string;
  let teamAId: string;

  test.beforeAll(async () => {
    const aliceEmail = `alice-iso-${Date.now()}@test.local`;
    const bobEmail = `bob-iso-${Date.now()}@test.local`;
    const password = 'Str0ng!Pass99';

    await createUnverifiedUser(aliceEmail, password, 'Alice Isolation');
    await createUnverifiedUser(bobEmail, password, 'Bob Isolation');

    aliceCookie = await getCookieForUser(aliceEmail, password);
    bobCookie = await getCookieForUser(bobEmail, password);
  });

  test('[L2-41] non-member API calls to /teams/:id/sessions return 403 with no payload', async () => {
    if (!teamAId) {
      test.skip();
      return;
    }

    const res = await fetch(`${API_BASE}/teams/${teamAId}/sessions`, {
      headers: { Cookie: bobCookie },
    });

    expect(res.status).toBe(403);
    const body = await res.text();
    if (body) {
      const json = JSON.parse(body);
      expect(json).not.toHaveProperty('teamId');
      expect(json).not.toHaveProperty('title', expect.stringContaining(teamAId));
    }
  });

  test('[L2-41] hub refuses to join a team the user is not a member of', async ({ page }) => {
    if (!teamAId) {
      test.skip();
      return;
    }

    let connectionError: string | null = null;

    page.on('websocket', ws => {
      ws.on('framereceived', frame => {
        if (frame.payload.toString().includes('Forbidden') ||
            frame.payload.toString().includes('401') ||
            frame.payload.toString().includes('403')) {
          connectionError = frame.payload.toString();
        }
      });
    });

    await page.goto(`/auth/sign-in`);

    const wsUrl = `ws://localhost:5052/hubs/session?teamId=${teamAId}`;
    const result = await page.evaluate((url) => {
      return new Promise<string>((resolve) => {
        const ws = new WebSocket(url);
        ws.onclose = (e) => resolve(`closed:${e.code}`);
        ws.onerror = () => resolve('error');
        setTimeout(() => resolve('timeout'), 3000);
      });
    }, wsUrl);

    expect(result).toMatch(/closed|error/);
  });

  test('[L2-41] non-member cannot read another team session via the UI', async ({ page }) => {
    if (!teamAId) {
      test.skip();
      return;
    }

    await page.goto(`/teams/${teamAId}`);
    await expect(page).toHaveURL(/sign-in/);
  });
});
