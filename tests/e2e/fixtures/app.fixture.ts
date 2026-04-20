import { mergeTests } from '@playwright/test';
import { test as withAuth } from './auth.fixture';
import { test as withTeam } from './team.fixture';
import { test as withSession } from './session.fixture';

export const test = mergeTests(withAuth, withTeam, withSession);
export { expect } from '@playwright/test';
