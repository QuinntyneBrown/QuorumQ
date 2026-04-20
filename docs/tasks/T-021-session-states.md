# T-021 — Lunch session states

**Traces to:** L1-04, L1-05 / L2-08
**Depends on:** T-020
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/SessionEndpoints.cs`)
**Status:** Assigned

## Goal

Sessions progress through explicit states: `Suggesting → Voting → Decided`,
or `Cancelled`. The organizer can move from `Suggesting` to `Voting`; the
deadline transitions `Voting` to `Decided` automatically; any active session
may be cancelled.

## Scope

### Backend
- `POST /sessions/:id/start-voting` — organizer-only; requires state
  `Suggesting`. Transitions to `Voting` and locks suggestions.
- `POST /sessions/:id/cancel` — organizer-only; allowed in any active
  state. Transitions to `Cancelled` (read-only thereafter).
- Background scheduler:
  - Hosted service `SessionDeadlineWorker` polls for sessions past
    deadline and transitions them to `Decided` (or to tie-breaker if the
    top vote is tied — T-028). Simple `Timer` with 5-second cadence; no
    third-party library (L2-47).
  - On transition, fires hub events: `session.stateChanged`,
    `session.decided` (T-022 wires subscribers).
- Add `State` chip to all session responses.

### Frontend — `features/sessions/session.page.ts`
- State chip shows current state (colour from tokens).
- Organizer sees a "Start voting" button during `Suggesting`.
- "Cancel session" menu item on the session toolbar (confirm dialog).
- State changes reflected via signals; when hub emits `stateChanged`,
  page updates without navigation.

### E2E — `tests/e2e/pages/sessions/session.page.ts`
- `tapStartVoting()`, `cancelSession()`, `expectState(state)`.
- Helpers use the test-only time endpoint (T-022 exposes
  `/_test/advance-time` gated by `environment.e2eHooks`) to force
  deadline passage.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/sessions/L2-08.session-states.spec.ts`:
  - `[L2-08] organizer transitions Suggesting → Voting and suggestions lock`
  - `[L2-08] deadline passing transitions Voting → Decided and announces the winner`
  - `[L2-08] organizer cancels an active session and it becomes read-only`

## Folder-structure pointers

- `src/api/Endpoints/SessionEndpoints.cs` (extended)
- `src/api/` — hosted service class: `Data/SessionDeadlineWorker.cs`
  (kept under `Data/` so it sits next to the `DbContext` it polls; if
  more workers appear, fold them into a tiny `Workers/` folder in a
  later task with an L2 update).
- `src/web/projects/app/src/app/features/sessions/session.page.ts`
- `tests/e2e/specs/sessions/L2-08.session-states.spec.ts`

## Definition of Done

- [ ] Failing spec added first; passes across all browsers.
- [ ] Only organizer can transition states (enforced by T-015 policy +
      session organizer check).
- [ ] Background worker transitions states within 6 seconds of deadline.
- [ ] UI reflects state changes without manual reload (via hub — T-022).
- [ ] Cancelled sessions show a read-only banner and disable all
      mutations.
