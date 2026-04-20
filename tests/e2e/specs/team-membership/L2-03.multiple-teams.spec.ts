import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { TeamSwitcherPage } from '../../pages/teams/team-switcher.page';
import { createUnverifiedUser } from '../../fixtures/auth.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

const SOLO_EMAIL = `e2e-solo-${Date.now()}@test.local`;
const SOLO_PASSWORD = 'Str0ng!Pass99';

test.describe('Multiple teams + switcher (L2-03)', () => {
  test.beforeAll(async () => {
    await createUnverifiedUser(SOLO_EMAIL, SOLO_PASSWORD, 'Solo User');
  });

  async function signInAs(page: Parameters<typeof SignInPage>[0], email: string, password: string): Promise<void> {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn({ email, password });
    await expect(page).toHaveURL(/teams/);
  }

  test('[L2-03] user with two teams sees both in the switcher and can select one to change context', async ({ page }) => {
    await signInAs(page, ALICE_EMAIL, ALICE_PASSWORD);

    await expect(page).toHaveURL(new RegExp(`/teams/${ALICE_TEAM_ID}`));

    const switcher = new TeamSwitcherPage(page);
    await switcher.openSwitcher();

    await expect(page.getByTestId(`team-item-${ALICE_TEAM_ID}`)).toBeVisible();

    await page.getByTestId(`team-item-${ALICE_TEAM_ID}`).click();

    await expect(page).toHaveURL(new RegExp(`/teams/${ALICE_TEAM_ID}`));
  });

  test('[L2-03] user with no teams sees a prompt to create or accept an invite', async ({ page }) => {
    await signInAs(page, SOLO_EMAIL, SOLO_PASSWORD);

    await expect(page).toHaveURL(/\/teams\/no-teams/);

    await expect(page.getByTestId('create-team-cta')).toBeVisible();
    await expect(page.getByTestId('have-invite-btn')).toBeVisible();
  });
});
