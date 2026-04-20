# T-020 — Start a lunch session

**Traces to:** L1-04, L1-07 / L2-07
**Depends on:** T-015, T-019
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/SessionEndpoints.cs`), §5.1 (`features/sessions/`)

## Goal

Any team member can start a new lunch session for today with a configurable
voting deadline between 5 and 180 minutes. If an active session already
exists, the member is taken to it instead of creating a duplicate.

## Scope

### Backend
- `POST /teams/:id/sessions` — body `{ deadlineMinutes (5..180) }`.
  - Enforces "one active session per team per day" atomically (unique
    partial index or transaction); when a duplicate is attempted, returns
    200 with the existing session rather than 409 for friendlier UX.
  - Creates session in state `Suggesting`, `Deadline = now +
    deadlineMinutes`.
  - Publishes `session.started` on the hub (T-022 wires this; for now
    emit via `IHubContext` placeholder).
- `GET /teams/:id/sessions/:sessionId` — session detail (state, deadline,
  suggestions/votes aggregated — fleshed out in later tasks).

### Frontend — `features/sessions/`
- `start-session.page.ts`:
  - Material slider or stepper to pick deadline in 5-min increments;
    default 45 min.
  - "Start lunch" primary button.
  - On success, navigates to `/teams/:teamId/sessions/:sessionId`
    (`session.page.ts` — partial shell here; fleshed out by T-021…T-030).
- `session.page.ts`:
  - Loads session by id; shows state chip + countdown; container slots for
    suggestions, votes, comments, presence (filled by later tasks).

### E2E
- `tests/e2e/pages/sessions/start-session.page.ts` with
  `chooseDeadline(minutes)`, `startLunch()`, `expectRedirectedToExisting()`.
- `tests/e2e/pages/sessions/session.page.ts` (basic shell).

### Fixture
- `tests/e2e/fixtures/session.fixture.ts` — extend with a
  `createSessionInState('Suggesting' | 'Voting' | 'Decided' | 'Cancelled')`
  factory used by later tasks.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/sessions/L2-07.start-session.spec.ts`:
  - `[L2-07] team member starts a lunch session with a 45-minute deadline and it becomes visible on the dashboard`
  - `[L2-07] starting a lunch when an active one exists routes to the existing session`
  - `[L2-07] deadline under 5 min or over 180 min is rejected inline`

## Folder-structure pointers

- `src/api/Endpoints/SessionEndpoints.cs`
- `src/web/projects/app/src/app/features/sessions/start-session.page.ts`
- `src/web/projects/app/src/app/features/sessions/session.page.ts`
- `tests/e2e/specs/sessions/L2-07.start-session.spec.ts`

## Definition of Done

- [ ] Failing Playwright spec added first; passes on all browsers.
- [ ] Atomic "one active per team per day" enforced at the DB level.
- [ ] Deadline slider clamps to 5–180 min and shows the absolute time as
      helper text.
- [ ] Session page loads without errors for all states (empty slots for
      not-yet-implemented features).
