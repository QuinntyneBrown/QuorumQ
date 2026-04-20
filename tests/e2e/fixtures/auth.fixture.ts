import { test as base } from '@playwright/test';
import { apiPost, apiDelete } from '../support/api-client';
import { makeUser, User, UserSchema } from '../support/test-data';

interface AuthFixture {
  authUser: User;
}

export const test = base.extend<AuthFixture>({
  authUser: async ({}, use) => {
    const res = await apiPost('/users', makeUser());
    const user = UserSchema.parse(await res.json());
    await use(user);
    await apiDelete(`/users/${user.id}`);
  },
});

export async function createUnverifiedUser(email: string, password = 'Str0ng!Pass99', displayName = 'E2E User'): Promise<void> {
  await apiPost('/auth/sign-up', { email, password, displayName });
}
