import { test, expect } from '@playwright/test';
import { CreateTeamPage } from '../../pages/teams/create-team.page';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { createUnverifiedUser } from '../../fixtures/auth.fixture';

const EMAIL = `e2e-create-team-${Date.now()}@test.local`;
const PASSWORD = 'Str0ng!Pass99';
const DISPLAY = 'Team Creator';

test.describe('Create team (L2-01)', () => {
  test.beforeAll(async () => {
    await createUnverifiedUser(EMAIL, PASSWORD, DISPLAY);
  });

  async function signIn(page: Parameters<typeof SignInPage>[0]): Promise<void> {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn({ email: EMAIL, password: PASSWORD });
    await expect(page).toHaveURL(/teams/);
  }

  test('[L2-01] authenticated user creates a team with a 3–50 char name and lands on the dashboard as Owner', async ({ page }) => {
    await signIn(page);

    const createTeam = new CreateTeamPage(page);
    await createTeam.goto();

    const teamName = `My Team ${Date.now()}`;
    await createTeam.createTeam(teamName, 'A test team');

    await expect(page).toHaveURL(/\/teams\/[0-9a-f-]{36}/);
    await expect(page.getByTestId('team-name')).toContainText(teamName);
    await expect(page.getByTestId('caller-role')).toContainText('Owner');
  });

  test('[L2-01] name shorter than 3 or longer than 50 shows an inline validation error', async ({ page }) => {
    await signIn(page);

    const createTeam = new CreateTeamPage(page);
    await createTeam.goto();

    await page.getByTestId('team-name-input').fill('ab');
    await page.getByTestId('team-name-input').blur();

    await createTeam.expectNameValidationError('3–50');

    await page.getByTestId('team-name-input').fill('a'.repeat(51));
    await page.getByTestId('team-name-input').blur();

    await createTeam.expectNameValidationError('3–50');
  });

  test('[L2-01] the creator is listed as the sole member with role Owner', async ({ page }) => {
    await signIn(page);

    const createTeam = new CreateTeamPage(page);
    await createTeam.goto();

    const teamName = `Solo Team ${Date.now()}`;
    await createTeam.createTeam(teamName);

    await expect(page).toHaveURL(/\/teams\/[0-9a-f-]{36}/);
    await expect(page.getByTestId('member-count')).toContainText('1 member');
    await expect(page.getByTestId('caller-role')).toContainText('Owner');
  });
});
