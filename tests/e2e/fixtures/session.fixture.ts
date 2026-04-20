import { test as base } from '@playwright/test';
import { apiPost, apiDelete } from '../support/api-client';
import { makeSession, Session, SessionSchema } from '../support/test-data';

interface SessionFixture {
  session: Session;
  teamId: string;
}

export const test = base.extend<SessionFixture>({
  teamId: ['', { option: true }],
  session: async ({ teamId }, use) => {
    const res = await apiPost('/sessions', makeSession(teamId));
    const session = SessionSchema.parse(await res.json());
    await use(session);
    await apiDelete(`/sessions/${session.id}`);
  },
});
