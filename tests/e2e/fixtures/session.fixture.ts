import { test as base, APIRequestContext } from '@playwright/test';

const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:5052';

export type SessionState = 'Suggesting' | 'Voting' | 'Decided' | 'Cancelled';

export interface CreatedSession {
  id: string;
  teamId: string;
  state: string;
  deadline: string;
  startedAt: string;
}

export async function createSessionInState(
  request: APIRequestContext,
  teamId: string,
  _state: SessionState = 'Suggesting',
): Promise<CreatedSession> {
  const res = await request.post(`${API_BASE}/teams/${teamId}/sessions`, {
    data: { deadlineMinutes: 30 },
    failOnStatusCode: false,
  });
  const body = await res.json();
  return body as CreatedSession;
}

export async function deleteSession(request: APIRequestContext, sessionId: string): Promise<void> {
  await request.delete(`${API_BASE}/sessions/${sessionId}`).catch(() => {});
}

interface SessionFixture {
  teamId: string;
  createdSession: CreatedSession;
}

export const test = base.extend<SessionFixture>({
  teamId: ['', { option: true }],
  createdSession: async ({ request, teamId }, use) => {
    const session = await createSessionInState(request, teamId);
    await use(session);
    await deleteSession(request, session.id);
  },
});
