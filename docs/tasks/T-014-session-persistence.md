# T-014 — Session persistence

**Traces to:** L1-02, L1-16 / L2-06
**Depends on:** T-013
**Primary area:** full stack (frontend-heavy)
**Design refs:** `docs/designs/05-screens-auth.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`core/auth/session.store.ts`)
**Status:** Complete

## Goal

A signed-in user stays signed in across page reloads and browser restarts
within the session lifetime. When the session expires mid-action, the user
is prompted to sign in and, on success, returned to where they left off.

## Scope

### Frontend
- `core/auth/session.store.ts`:
  - Signal-based store: `user`, `lastTeamId`, `returnTo` (pending route).
  - Hydrates on app start by calling `GET /auth/me`.
  - Exposes `requireAuth(route)` helper used by `AuthGuard`.
- `core/auth/auth.guard.ts`:
  - Redirects unauthenticated users to `/auth/sign-in?return=<encoded>`.
  - After successful sign-in (T-013), reads `return` and navigates there.
- `core/api/interceptors/auth.interceptor.ts`:
  - On 401 mid-request, captures current URL + body snapshot, routes to
    `/auth/sign-in?return=…`; after re-auth, replays the pending route
    (not the request body — the user re-submits intentionally).
- Hook for sliding refresh: API issues a fresh cookie on every request
  (handled server side by T-011 cookie options) — client only ensures
  long-running tabs call `GET /auth/me` after focus regain.

### Backend
- Confirm cookie options: sliding expiration, configurable max-age
  (default 7 days), re-issued on each authenticated request (L2-06).
- Expose `GET /auth/me` (already T-011) as the hydration endpoint.

### E2E — fixtures & pages
- Extend `tests/e2e/pages/auth/sign-in.page.ts` with
  `returnsToRouteAfterReauth(route)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/auth/L2-06.session-persistence.spec.ts`:
  - `[L2-06] signed-in user remains signed in after page reload`
  - `[L2-06] closing and reopening the browser keeps the user signed in within session lifetime`
  - `[L2-06] expired session prompts re-auth and resumes at the original route`

Use `context.storageState()` snapshotting and `context.clearCookies()` to
simulate reload and restart deterministically.

## Folder-structure pointers

- `src/web/projects/app/src/app/core/auth/session.store.ts`
- `src/web/projects/app/src/app/core/auth/auth.guard.ts`
- `tests/e2e/specs/auth/L2-06.session-persistence.spec.ts`

## Definition of Done

- [x] Spec passes across all four browser projects.
- [x] Reload with the cookie present does NOT bounce through the sign-in
      screen.
- [x] Session expiry navigates to sign-in with `return` query param; after
      re-auth, the original route resumes.
- [x] No token stored in `localStorage` or `sessionStorage` (only
      `lastTeamId` / UI prefs) — cookie is the only credential (L2-42).
