# T-013 — Sign in / sign out

**Traces to:** L1-02 / L2-05
**Depends on:** T-011, T-012
**Primary area:** full stack (frontend-heavy)
**Design refs:** `docs/designs/05-screens-auth.md`, `docs/designs/04-layout-navigation.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/auth/`, `core/auth/`)

## Goal

A returning user signs in with valid credentials and is routed to their last
active team. They can sign out from the account menu in the top app bar.
Three consecutive failures trigger a clear rate-limit message.

## Scope

### Frontend
- `features/auth/sign-in.page.ts`:
  - Email + password form, "Forgot password?" link (stub route),
    "Remember me" omitted — session lifetime handled by T-014.
  - Calls `AuthService.signIn(…)`; on 200, navigates to the last-team
    dashboard (`/teams/:id` stored in `SessionStore`), or `/teams` when
    none.
  - Displays rate-limit message on 429 with a countdown derived from the
    `Retry-After` header.
- `core/auth/auth.service.ts` — add `signIn`, `signOut`, `currentUser()`,
  `setLastTeam(teamId)`, `getLastTeam()` (stored in `localStorage`).
- `core/api/interceptors/auth.interceptor.ts`:
  - Adds `credentials: 'include'` for cross-site cookies in Dev.
  - On 401, clears `SessionStore` and routes to `/auth/sign-in?return=…`.
- App shell account menu (from T-007): "Sign out" calls `signOut()` and
  navigates to `/auth/sign-in`.

### Backend
- Covered by T-011; verify `POST /auth/sign-out` works with the cookie.

### E2E — `tests/e2e/pages/auth/sign-in.page.ts`
- `signIn({email,password})`, `expectRateLimited(retryAfterSeconds)`,
  `expectAccountMenuVisible()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/auth/L2-05.sign-in-out.spec.ts`:
  - `[L2-05] registered user signs in and lands on their last active team`
  - `[L2-05] signing out clears the session and returns to landing`
  - `[L2-05] three rapid failed sign-ins surface a rate-limit message`

## Folder-structure pointers

- `src/web/projects/app/src/app/features/auth/sign-in.page.ts`
- `src/web/projects/app/src/app/core/auth/auth.service.ts`
- `src/web/projects/app/src/app/core/api/interceptors/auth.interceptor.ts`
- `tests/e2e/pages/auth/sign-in.page.ts`
- `tests/e2e/specs/auth/L2-05.sign-in-out.spec.ts`

## Definition of Done

- [ ] Failing Playwright spec added first; passes after implementation.
- [ ] Sign-in navigates to `/teams/:lastId` or `/teams` when no history.
- [ ] Sign-out clears cookie server-side AND client signals.
- [ ] Rate-limit UI surfaces a countdown derived from `Retry-After`.
- [ ] Keyboard-only sign-in and sign-out verified in the spec (L2-23).
