# T-016 — Create a team

**Traces to:** L1-01, L1-16 / L2-01
**Depends on:** T-014, T-015, T-007
**Primary area:** full stack
**Design refs:** `docs/designs/06-screens-team.md`, `docs/designs/11-dialogs.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/teams/`), §4 (`Endpoints/TeamEndpoints.cs`)
**Status:** Assigned

## Goal

An authenticated, email-verified user can create a new team with a name and
optional description. The creator becomes the sole Owner and lands on the
team dashboard.

## Scope

### Backend — `src/api/Endpoints/TeamEndpoints.cs`
- `POST /teams` — body `{ name (3–50), description? }`. Creates `Team`
  (owner = current user) and a `Membership(Role=Owner)` atomically.
  Returns 201 with the team.
- `GET /teams/:id` — returns team + caller's membership + member count.
  `.RequireTeamMembership()`.
- Validation returns `ProblemDetails` with field-level errors.

### Frontend — `src/web/projects/app/src/app/features/teams/`
- `create-team.page.ts`:
  - Material form with `mat-form-field` for name and description.
  - Submit button (component library) disabled until valid.
  - On 201, routes to `/teams/:id` (see T-019).
- `teams.routes.ts` — adds `/teams/new` → `create-team.page.ts`.
- When the shell's "Create Team" action is tapped (in top app bar or
  empty state), route to `/teams/new`.

### E2E
- `tests/e2e/pages/teams/create-team.page.ts` with `createTeam(name,
  description?)`, `expectNameValidationError(message)`.
- `tests/e2e/fixtures/team.fixture.ts` — `createTeam` factory already
  creates via API; this spec exercises the UI path explicitly.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/team-membership/L2-01.create-team.spec.ts`:
  - `[L2-01] authenticated user creates a team with a 3–50 char name and lands on the dashboard as Owner`
  - `[L2-01] name shorter than 3 or longer than 50 shows an inline validation error`
  - `[L2-01] the creator is listed as the sole member with role Owner`

## Folder-structure pointers

- `src/api/Endpoints/TeamEndpoints.cs`
- `src/web/projects/app/src/app/features/teams/create-team.page.ts`
- `tests/e2e/pages/teams/create-team.page.ts`
- `tests/e2e/specs/team-membership/L2-01.create-team.spec.ts`

## Definition of Done

- [ ] Failing Playwright spec added first; passes across all browser
      projects.
- [ ] `POST /teams` rejected for unverified users (contract from T-012).
- [ ] Team create page renders correctly at 375 px (thumb-reachable).
- [ ] Zero axe critical/serious violations.
- [ ] Owner membership created atomically with the team (transactional).
