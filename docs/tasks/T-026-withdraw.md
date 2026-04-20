# T-026 — Withdraw own suggestion

**Traces to:** L1-03 / L2-12
**Depends on:** T-024
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`, `docs/designs/11-dialogs.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/SuggestionEndpoints.cs`), §5.1 (`features/suggestions/`)
**Status:** Open

## Goal

A user may withdraw their own suggestion while the session is in
`Suggesting`. The suggestion is immediately removed for all members. Once
voting starts, the withdraw action is no longer available.

## Scope

### Backend
- `DELETE /sessions/:id/suggestions/:suggestionId` —
  - `.RequireTeamMembership()` AND suggestion author check.
  - Requires `session.State == Suggesting`; else 409.
  - Sets `Suggestion.WithdrawnAt`; emits `SuggestionWithdrawn` hub event.

### Frontend
- `suggestion-list.component.ts` — show a "Withdraw" icon button only on
  the current user's own suggestions and only in `Suggesting` state.
- Confirm before withdraw via `@components/confirm-dialog`.
- On hub `SuggestionWithdrawn`, the list removes the entry with a
  collapse animation respecting reduced motion (T-041).

### E2E — `tests/e2e/pages/suggestions/suggestion-form.page.ts` +
`tests/e2e/pages/sessions/session.page.ts`
- Add `withdrawOwnSuggestion()` and `expectNoWithdrawOption()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/suggestions/L2-12.withdraw.spec.ts`:
  - `[L2-12] author withdraws their suggestion during Suggesting and it disappears for all members`
  - `[L2-12] Withdraw action is unavailable once session enters Voting`

## Folder-structure pointers

- `src/api/Endpoints/SuggestionEndpoints.cs` (extended)
- `src/web/projects/app/src/app/features/suggestions/suggestion-list.component.ts`
- `tests/e2e/specs/suggestions/L2-12.withdraw.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Non-authors see no Withdraw action on a suggestion they didn't
      create (authz enforced both in UI and API — L2-41).
- [ ] Two contexts observe the withdraw within 2 s (L2-19 regression
      guard).
- [ ] Confirm dialog dismissable with Escape; cancel does not mutate.
