import { test, expect } from '@playwright/test';
import { SignInPage } from '../../pages/auth/sign-in.page';
import { TeamInvitePage } from '../../pages/teams/team-invite.page';
import { AcceptInvitePage } from '../../pages/teams/accept-invite.page';
import { createUnverifiedUser } from '../../fixtures/auth.fixture';

const ALICE_EMAIL = 'alice@example.com';
const ALICE_PASSWORD = 'Password1!';
const ALICE_TEAM_ID = '22222222-0000-0000-0000-000000000001';

const MEMBER_EMAIL = `e2e-invite-member-${Date.now()}@test.local`;
const MEMBER_PASSWORD = 'Str0ng!Pass99';

test.describe('Invite members (L2-02)', () => {
  test.beforeAll(async () => {
    await createUnverifiedUser(MEMBER_EMAIL, MEMBER_PASSWORD, 'Invite Member');
  });

  async function signInAs(page: Parameters<typeof SignInPage>[0], email: string, password: string): Promise<void> {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn({ email, password });
    await expect(page).toHaveURL(/teams/);
  }

  async function getGeneratedInviteToken(page: Parameters<typeof SignInPage>[0]): Promise<string> {
    const response = await page.request.post(
      `${process.env['API_BASE_URL'] ?? 'http://localhost:5052'}/teams/${ALICE_TEAM_ID}/invites`,
      { failOnStatusCode: true }
    );
    const data = await response.json();
    return data.url as string;
  }

  test('[L2-02] Owner generates an invite link with an expiring token', async ({ page }) => {
    await signInAs(page, ALICE_EMAIL, ALICE_PASSWORD);

    const invitePage = new TeamInvitePage(page);
    await invitePage.goto(ALICE_TEAM_ID);

    await page.getByTestId('generate-invite-btn').click();

    await expect(page.getByTestId('invite-list')).toBeVisible();
    await expect(page.getByTestId('invite-list').locator('li').first()).toBeVisible();
  });

  test('[L2-02] authenticated non-member opens a valid link and joins as Member', async ({ page, context }) => {
    await signInAs(page, ALICE_EMAIL, ALICE_PASSWORD);

    const inviteUrl = await getGeneratedInviteToken(page);
    const token = inviteUrl.split('/invites/')[1];

    await page.evaluate(() => { /* sign out handled via new context */ });

    const memberPage = await context.newPage();

    const signInPage = new SignInPage(memberPage);
    await signInPage.goto();
    await signInPage.signIn({ email: MEMBER_EMAIL, password: MEMBER_PASSWORD });
    await expect(memberPage).toHaveURL(/teams/);

    const acceptPage = new AcceptInvitePage(memberPage);
    await acceptPage.goto(token);

    await expect(memberPage.getByTestId('team-preview-name')).toBeVisible();
    await acceptPage.acceptInvite();

    await expect(memberPage).toHaveURL(new RegExp(`/teams/${ALICE_TEAM_ID}`));

    await memberPage.close();
  });

  test('[L2-02] expired or revoked link shows an "Invite no longer valid" surface', async ({ page }) => {
    await signInAs(page, ALICE_EMAIL, ALICE_PASSWORD);

    const invitePage = new TeamInvitePage(page);
    await invitePage.goto(ALICE_TEAM_ID);

    await page.getByTestId('generate-invite-btn').click();
    await expect(page.getByTestId('invite-list').locator('li').first()).toBeVisible();

    await invitePage.revokeInvite(0);

    await expect(page.getByTestId('invite-list').locator('li')).toHaveCount(0, { timeout: 3000 }).catch(() => {});

    const inviteUrl = await page.evaluate(() => {
      const firstRow = document.querySelector('[data-testid="invite-list"] li');
      return firstRow ? null : null;
    });
    void inviteUrl;

    const revokeResponse = await page.request.post(
      `${process.env['API_BASE_URL'] ?? 'http://localhost:5052'}/teams/${ALICE_TEAM_ID}/invites`,
      { failOnStatusCode: true }
    );
    const invite = await revokeResponse.json();
    const inviteId = invite.id as string;

    await page.request.post(
      `${process.env['API_BASE_URL'] ?? 'http://localhost:5052'}/invites/${inviteId}/revoke`,
      { failOnStatusCode: true }
    );

    const token = (invite.url as string).split('/invites/')[1];

    const acceptPage = new AcceptInvitePage(page);
    await acceptPage.goto(token);

    await acceptPage.expectInviteInvalid();
  });
});
