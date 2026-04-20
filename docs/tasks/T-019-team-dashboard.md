# T-019 — Team dashboard + active session surface

**Traces to:** L1-04, L1-07, L1-08 / L2-09
**Depends on:** T-018, T-020 (partial — session card needs a session to
show; the "no active session" path can land first and the "active session"
path is completed after T-020 merges)
**Primary area:** frontend (with small backend read-only endpoint)
**Design refs:** `docs/designs/06-screens-team.md`, `docs/designs/07-screens-session.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/teams/team-dashboard.page.ts`)
**Status:** Assigned

## Goal

The team dashboard at `/teams/:id` surfaces the active lunch session
prominently. On mobile, a full-width card with status + countdown is the
first element above the fold. With no active session, a primary "Start
lunch" CTA is at the top.

## Scope

### Backend
- `GET /teams/:id/dashboard` — aggregated read returning `{ team,
  activeSession?, recentSessions[] }`. Small, endpoint-specific DTO
  (`DashboardResponse`) co-located in `Models/`.

### Frontend — `features/teams/team-dashboard.page.ts`
- When `activeSession` present: full-width `@components/session-card`
  above the fold with state chip + `@components/countdown`.
- When absent: primary Material button "Start lunch" routes to
  `/teams/:id/sessions/new` (T-020).
- Below: recent sessions list (small cards) linking to session detail
  (T-033 will enrich; until then link to the session page from T-020).

### Rules
- Page composed only of `@components/*` + Material — no ad-hoc styling
  (L2-24).
- Primary CTA must land in the bottom third at 375 px (L2-21).

### E2E — `tests/e2e/pages/teams/team-dashboard.page.ts`
- `expectActiveSessionCard()`, `expectStartLunchCta()`,
  `tapStartLunch()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/sessions/L2-09.view-active-session.spec.ts`:
  - `[L2-09] dashboard shows active session card as first above-the-fold element at 375px`
  - `[L2-09] dashboard without an active session surfaces a primary "Start lunch" action`

## Folder-structure pointers

- `src/api/Endpoints/TeamEndpoints.cs` (extended) or
  `src/api/Endpoints/DashboardEndpoints.cs` if the count of dashboard
  endpoints grows — prefer to keep it in `TeamEndpoints.cs` initially
  (L2-47).
- `src/web/projects/app/src/app/features/teams/team-dashboard.page.ts`
- `tests/e2e/specs/sessions/L2-09.view-active-session.spec.ts`

## Definition of Done

- [ ] Failing spec added first; passes on all four browser projects.
- [ ] At 375 px, the active session card (when present) is the first
      element above the fold and consumes full width.
- [ ] Works with and without an active session; both paths tested.
- [ ] No duplicate call for active session — single `GET /dashboard`.
