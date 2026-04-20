# T-033 — Session history

**Traces to:** L1-14 / L2-37
**Depends on:** T-029
**Primary area:** full stack
**Design refs:** `docs/designs/09-screens-history.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/HistoryEndpoints.cs`), §5.1 (`features/history/`)
**Status:** Open

## Goal

Each team has a history screen listing past lunch sessions newest-first with
date, winner, and final vote tally. Tapping an entry opens a read-only view
of that session's suggestions, votes, and comments.

## Scope

### Backend — `src/api/Endpoints/HistoryEndpoints.cs`
- `GET /teams/:id/history?page=&pageSize=` —
  paged list: `{ sessionId, date, winner, tally[], participantCount }`.
- `GET /sessions/:id/detail` — returns an immutable aggregate view
  suitable for rendering a decided/cancelled session read-only. Requires
  `.RequireTeamMembership()`.

### Frontend — `features/history/session-history.page.ts`
- Route: `/teams/:teamId/history`.
- List of `@components/card` rows; each tappable → routes to
  `/teams/:teamId/history/:sessionId` showing a read-only session.
- The read-only session re-uses pieces of `session.page.ts`
  (suggestion-list, vote-tally, comment-thread) in read-only mode — add a
  `readonly` input flag to the relevant components rather than forking
  them (L2-47).

### E2E — `tests/e2e/pages/sessions/session-history.page.ts`
- `expectSessionsListed(count)`, `openSession(indexOrWinnerName)`,
  `expectReadOnly()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/history/L2-37.session-history.spec.ts`:
  - `[L2-37] history lists past sessions newest-first with date, winner, tally`
  - `[L2-37] opening a past session shows suggestions, votes, and comments read-only`

## Folder-structure pointers

- `src/api/Endpoints/HistoryEndpoints.cs`
- `src/web/projects/app/src/app/features/history/session-history.page.ts`
- `tests/e2e/specs/history/L2-37.session-history.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Read-only mode disables every mutating control; screen reader
      announces "Read-only" on entry.
- [ ] Pagination via Material `matPaginator`; no client-side infinite
      scroll (L2-47 — prefer simplest).
