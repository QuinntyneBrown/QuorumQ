# T-028 — Tie breaking

**Traces to:** L1-05 / L2-14
**Depends on:** T-027, T-021
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/SessionEndpoints.cs`), §5.1 (`features/voting/`)
**Status:** Complete

## Goal

When the `Voting` deadline passes with two or more suggestions tied for
first, the system runs a visible tie-breaker round, limited to the tied
suggestions, lasting a default of 2 minutes. If still tied, the system
picks randomly and surfaces "Winner chosen at random".

## Scope

### Backend
- `SessionDeadlineWorker` (from T-021):
  - On deadline, if top vote count is tied across ≥ 2 suggestions, set
    `TieBreakDeadline = now + 2 min` and keep state `Voting` with a
    new flag `IsTieBreak = true`. Emits `TieBreakStarted(tiedSuggestionIds)`.
  - Votes that were for non-tied suggestions are cleared for the
    tie-break round.
  - On tie-break deadline:
    - If a single leader, transition to `Decided` normally.
    - If still tied, pick randomly from the tied set, set
      `WinnerChosenAtRandom=true`, and transition to `Decided`.
- Session detail response includes `tieBreak: { active, tiedSuggestionIds,
  deadline }`.

### Frontend
- `features/voting/tie-break-banner.component.ts`:
  - Shown in `session.page.ts` when `tieBreak.active === true`.
  - Uses `@components/countdown` and shows only the tied suggestions as
    votable (non-tied suggestions rendered read-only).
- Winner reveal (T-029) reads `WinnerChosenAtRandom` and shows a chip
  "Winner chosen at random" under the restaurant name.

### E2E
- `tests/e2e/pages/voting/vote-panel.page.ts` — add
  `expectTieBreakActive()`, `expectOnlyTiedVotable(names[])`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/voting/L2-14.tie-breaking.spec.ts`:
  - `[L2-14] deadline with a tie enters a 2-minute tie-break round limited to tied suggestions`
  - `[L2-14] tie-break ending with a single leader transitions to Decided`
  - `[L2-14] tie-break ending still tied picks a random winner and announces it as chosen at random`

Use dev-only time helpers (T-022) to drive deadlines.

## Folder-structure pointers

- `src/api/Data/SessionDeadlineWorker.cs` (extended)
- `src/api/Endpoints/SessionEndpoints.cs` (extended response)
- `src/web/projects/app/src/app/features/voting/tie-break-banner.component.ts`
- `tests/e2e/specs/voting/L2-14.tie-breaking.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Tie-break round is strictly time-boxed (2 min default) and votable
      only on tied suggestions.
- [ ] Random winner selection is transparently surfaced (L2-14).
- [ ] Hub events propagate tie-break start and resolution.
