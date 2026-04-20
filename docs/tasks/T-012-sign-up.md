# T-012 — Sign up with email

**Traces to:** L1-02, L1-16 / L2-04
**Depends on:** T-007, T-011, T-009
**Primary area:** full stack
**Design refs:** `docs/designs/05-screens-auth.md`, `docs/designs/12-errors-empty-states.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/auth/`), §6 (`specs/auth/`)
**Status:** Assigned

## Goal

A visitor can sign up with email + password. Weak passwords are prevented
in-line. Unverified users are prompted to verify before writing actions
(team create, vote).

## Scope

### Frontend — `src/web/projects/app/src/app/features/auth/`
- `sign-up.page.ts`:
  - Material `mat-card` form: email, password (with strength meter),
    display name.
  - Reactive form with validators matching API rules (email format,
    password ≥ 10 chars, complexity classes, display name 2–40).
  - Uses `@components/button` for primary submit.
  - On submit, calls `AuthService.signUp(…)` (extend `core/auth/`); on
    success, routes to `/auth/verify-email-sent` and announces via
    `NotificationService`.
  - Shows `ProblemDetails.errors` inline on 400; generic toast on 500.
- `verify-email-sent.page.ts`, `verify-email.page.ts`:
  - Minimal confirmation screens; `/auth/verify?token=…` route consumes
    the token via `POST /auth/verify-email` (T-011).
- `auth.routes.ts` — wires the pages with `loadComponent`.
- `core/auth/auth.service.ts` — extend with `signUp`, `verifyEmail`;
  exposes a `user` signal.

### Backend
- Already covered by T-011. Verify the client calls work end-to-end.

### E2E — `tests/e2e/pages/auth/sign-up.page.ts`
- `fillEmail(string)`, `fillPassword(string)`, `fillDisplayName(string)`,
  `submit()`, `expectValidationError(field, message)`.

### Fixtures
- `tests/e2e/fixtures/auth.fixture.ts` — add `createUnverifiedUser(email)`
  factory via API.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/auth/L2-04.sign-up.spec.ts`:
  - `[L2-04] visitor submits valid email and strong password → account created, verification email noted`
  - `[L2-04] weak password submission is blocked by the strength meter`
  - `[L2-04] unverified user is prompted to verify before creating a team`

## Folder-structure pointers

- `src/web/projects/app/src/app/features/auth/sign-up.page.ts`
- `src/web/projects/app/src/app/core/auth/auth.service.ts`
- `tests/e2e/pages/auth/sign-up.page.ts`
- `tests/e2e/specs/auth/L2-04.sign-up.spec.ts`

## Definition of Done

- [ ] Failing Playwright spec written first; implementation makes it pass.
- [ ] Password strength meter prevents submission below threshold (L2-04).
- [ ] Unverified user trying to create a team (T-016) is prompted to
      verify — cross-task contract documented here for T-016 consumers.
- [ ] Axe returns zero critical/serious violations on the sign-up page.
- [ ] Page works at 375 px width with primary action thumb-reachable.
