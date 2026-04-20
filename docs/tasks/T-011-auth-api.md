# T-011 — Authentication API

**Traces to:** L1-02, L1-16 / L2-04 (API), L2-05 (API), L2-06 (API), L2-42
**Depends on:** T-010
**Primary area:** backend
**Design refs:** `docs/designs/05-screens-auth.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/AuthEndpoints.cs`, `Auth/`)
**Status:** Open

## Goal

Implement the API surface for sign up, sign in, sign out, session lookup,
and rate-limited sign-in attempts. Passwords are hashed with a modern KDF
(Argon2id preferred; ASP.NET Core Identity's default PBKDF2 acceptable if it
avoids introducing new packages). All traffic is HTTPS.

## Scope

### `src/api/Auth/`
- `AuthOptions.cs` — config for token lifetime, cookie options, rate limit
  thresholds.
- `PasswordHasher.cs` — thin wrapper around the chosen KDF (no plaintext
  store ever — L2-42).
- `Program.cs` wiring:
  - `AddAuthentication(…)` with cookie-based auth (simple, no new
    packages); `HttpOnly`, `Secure`, `SameSite=Lax`, sliding expiration
    matching session lifetime (L2-06).
  - `AddAuthorization()` with the baseline policy.
  - `UseHttpsRedirection()` in all environments; `UseHsts()` in
    non-development (L2-42).
  - Rate limiter: named policy `auth-signin` — 5 attempts per 10 minutes
    per IP + email (L2-05).

### `src/api/Endpoints/AuthEndpoints.cs`
- `POST /auth/sign-up` — accepts `{ email, password, displayName }`;
  validates email format, password rules (>= 10 chars, mix of classes),
  creates user, queues verification email (stubbed — T-012 surfaces the
  flow), responds 201 with the created user summary.
- `POST /auth/sign-in` — accepts `{ email, password }`; returns 200 with
  session user on success, 401 otherwise. Wrapped with the `auth-signin`
  rate limiter.
- `POST /auth/sign-out` — clears the auth cookie, 204.
- `GET /auth/me` — 200 with the current user, 401 otherwise.
- `POST /auth/verify-email` — accepts `{ token }`; marks
  `EmailVerifiedAt`. Email sending is left as a logger in Dev.
- All endpoints return JSON; error shape is `ProblemDetails`.

### Rules
- No plaintext passwords persisted (L2-42).
- No MediatR / CQRS pipeline — endpoint handlers call `AppDbContext`
  directly (L2-47).
- Rate limit messages are not information-leak-y (same 401 whether the
  user exists or not; separate 429 for rate limit).

## ATDD — Failing tests first (L2-35)

E2E specs are owned by T-012/13/14 (frontend slices). This task contributes
the API-level test:
- `tests/api/AuthEndpointsTests.cs`:
  - `[L2-42] passwords are not stored in plaintext`
  - `[L2-05] five consecutive failed sign-ins trigger a 429`
  - `[L2-06] /auth/me round-trips the session cookie`

Keep the tests project minimal — add it only if not already present.

## Folder-structure pointers

- `src/api/Endpoints/AuthEndpoints.cs`
- `src/api/Auth/AuthOptions.cs`
- `src/api/Auth/PasswordHasher.cs`

## Definition of Done

- [ ] `POST /auth/sign-up`, `/sign-in`, `/sign-out`, `GET /auth/me`
      documented in `/swagger` (Dev only — L2-44).
- [ ] Password hashes use a modern KDF with per-user salt; plaintext never
      persisted (L2-42).
- [ ] `auth-signin` rate limiter returns 429 after 5 failed attempts
      (L2-05).
- [ ] HTTPS redirection on in all environments; HSTS on outside Dev
      (L2-42).
- [ ] Cookie is `HttpOnly`, `Secure`, `SameSite=Lax` (L2-42, L2-06).
