import { z } from 'zod';

let counter = 0;
const uid = () => `${Date.now()}-${++counter}`;

export const UserSchema = z.object({ id: z.string(), email: z.string(), name: z.string() });
export type User = z.infer<typeof UserSchema>;

export const TeamSchema = z.object({ id: z.string(), name: z.string() });
export type Team = z.infer<typeof TeamSchema>;

export const SessionSchema = z.object({ id: z.string(), teamId: z.string() });
export type Session = z.infer<typeof SessionSchema>;

export function makeUser(overrides: Partial<User> = {}): Omit<User, 'id'> & Partial<Pick<User, 'id'>> {
  const n = uid();
  return { email: `user-${n}@test.local`, name: `Test User ${n}`, ...overrides };
}

export function makeTeam(overrides: Partial<Team> = {}): Omit<Team, 'id'> & Partial<Pick<Team, 'id'>> {
  return { name: `Team ${uid()}`, ...overrides };
}

export function makeSession(teamId: string, overrides: Partial<Session> = {}): Omit<Session, 'id'> & Partial<Pick<Session, 'id'>> {
  return { teamId, ...overrides };
}
