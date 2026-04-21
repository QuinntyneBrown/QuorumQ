# T-027 — Cast a vote

**Traces to:** L1-05, L1-07 / L2-13
**Depends on:** T-024, T-022
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`, `docs/designs/14-motion.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/VoteEndpoints.cs`), §5.1 (`features/voting/`)
**Status:** Complete

## Goal

During `Voting`, each member casts one vote for one suggestion. Tapping
their current vote clears it; voting for a different suggestion moves the
vote and decrements the previous tally — all with realtime updates.

## Scope

### Backend — `src/api/Endpoints/VoteEndpoints.cs`
- `PUT /sessions/:id/votes` — body `{ suggestionId | null }`.
  - `null` clears any existing vote.
  - Otherwise, upserts the single `Vote` for `(SessionId, UserId)` — the
    unique index from T-010 enforces the one-vote rule at the DB level.
  - Requires `session.State == Voting` (or tie-break from T-028); else
    409.
  - Emits `VoteChanged(sessionId, tallies[])` with the updated counts.
- Session detail endpoint returns `votes: { suggestionId, count, youVoted }`
  so the UI can reflect state on load.

### Frontend — `features/voting/`
- `vote-button.component.ts` wrapping `@components/button`; shows active
  state when this suggestion holds the user's vote. Calls the vote endpoint.
- `vote-tally.component.ts` wrapping `@components/vote-tally`; animates
  tally changes.
- Wire into `suggestion-list.component.ts` — buttons visible only in
  `Voting` state; disabled with a tooltip otherwise.

### Accessibility
- Vote buttons announce the updated tally via `LiveAnnouncer` polite
  channel when the user's own vote changes (L2-28 partial — full coverage
  in T-043).

### E2E — `tests/e2e/pages/voting/vote-panel.page.ts`
- `castVoteFor(restaurantName)`, `clearVote()`, `expectVoteCount(name,
  count)`, `expectYouVoted(name)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/voting/L2-13.cast-vote.spec.ts`:
  - `[L2-13] member casts a vote in Voting state; tally updates for all members in real time`
  - `[L2-13] tapping a different suggestion moves the vote and decrements the previous tally`
  - `[L2-13] tapping the current vote clears it`

## Folder-structure pointers

- `src/api/Endpoints/VoteEndpoints.cs`
- `src/web/projects/app/src/app/features/voting/vote-button.component.ts`
- `src/web/projects/app/src/app/features/voting/vote-tally.component.ts`
- `tests/e2e/specs/voting/L2-13.cast-vote.spec.ts`

## Definition of Done

- [x] Failing spec first; passes on all browsers.
- [x] One-vote-per-user invariant enforced at the DB level (L2-10 index).
- [x] Two contexts see tally changes within 2 s (L2-19 regression guard).
- [x] Vote button keyboard-operable with `Space` / `Enter`.
- [x] Tally animation respects `prefers-reduced-motion` (L2-25).
