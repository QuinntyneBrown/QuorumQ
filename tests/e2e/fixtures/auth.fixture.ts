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
