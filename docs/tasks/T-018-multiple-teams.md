# T-018 — Multiple teams + switcher

**Traces to:** L1-01 / L2-03
**Depends on:** T-016, T-007
**Primary area:** full stack
**Design refs:** `docs/designs/04-layout-navigation.md`, `docs/designs/06-screens-team.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/teams/team-switcher.component.ts`)
**Status:** Assigned

## Goal

A user belonging to multiple teams can switch the active team from a
switcher in the top app bar. With no teams, the user is prompted to create
one or accept an invite.

## Scope

### Backend
- `GET /teams` — returns all teams the current user is a member of.
  Includes each team's role and unread notification count (unread filled
  in by T-035; zero until then).

### Frontend — `features/teams/`
- `team-switcher.component.ts`:
  - Material `matMenu` triggered from the app-bar team chip.
  - Lists user's teams; highlights the active one.
  - "Create new team" entry at the bottom links to `/teams/new`.
  - Switching writes `SessionStore.lastTeamId` and navigates to
    `/teams/:id`.
- `no-teams.page.ts` (empty state):
  - Uses `@components/empty-state` with two CTAs: "Create a team" →
    `/teams/new` and "I have an invite link" (prefills a paste input).
- `app.routes.ts` — adds a guard on `/` that routes to `/teams/:lastId`
  or `/teams/new` based on `GET /teams`.

### E2E
- `tests/e2e/pages/teams/team-switcher.page.ts` with
  `openSwitcher()`, `switchTo(teamName)`, `teamsListed()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/team-membership/L2-03.multiple-teams.spec.ts`:
  - `[L2-03] user with two teams sees both in the switcher and can select one to change context`
  - `[L2-03] user with no teams sees a prompt to create or accept an invite`

## Folder-structure pointers

- `src/api/Endpoints/TeamEndpoints.cs` (extended with `GET /teams`)
- `src/web/projects/app/src/app/features/teams/team-switcher.component.ts`
- `src/web/projects/app/src/app/features/teams/no-teams.page.ts`
- `tests/e2e/specs/team-membership/L2-03.multiple-teams.spec.ts`

## Definition of Done

- [ ] Switching teams updates the URL, the active-team chip in the app
      bar, and any feature pages observing `SessionStore`.
- [ ] Empty state is keyboard-navigable with a visible focus ring.
- [ ] Switcher opens with `Enter` / `Space` from the chip.
- [ ] Active team persists across reloads (stored via `SessionStore`,
      hydrated on app bootstrap).
