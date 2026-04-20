import { test as base } from '@playwright/test';
import { apiPost, apiDelete } from '../support/api-client';
import { makeTeam, Team, TeamSchema } from '../support/test-data';

interface TeamFixture {
  team: Team;
}

export const test = base.extend<TeamFixture>({
  team: async ({}, use) => {
    const res = await apiPost('/teams', makeTeam());
    const team = TeamSchema.parse(await res.json());
    await use(team);
    await apiDelete(`/teams/${team.id}`);
  },
});
