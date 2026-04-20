# T-046 — Transport & storage security audit

**Traces to:** L1-16 / L2-42
**Depends on:** T-011, T-014
**Primary area:** backend + e2e
**Design refs:** —
**Folder structure:** `docs/folder-structure.md` §6 (`specs/security/L2-42...`)
**Status:** Open

## Goal

All traffic is served over HTTPS with HSTS. User credentials are stored with
industry-standard hashing. No plaintext passwords are persisted. No credential
ends up in `localStorage` or `sessionStorage`.

## Scope

### Backend
- Verify `UseHttpsRedirection()` enabled in all environments.
- Verify `UseHsts()` enabled outside Development.
- Verify `PasswordHasher` uses a modern KDF (Argon2id or ASP.NET Core
  Identity's default PBKDF2 with ≥ 100k iterations) with per-user salt.
- API returns `Strict-Transport-Security: max-age=...; includeSubDomains`
  in production.

### Frontend
- Confirm no tokens or credentials persisted in `localStorage` or
  `sessionStorage` — only ephemeral UI prefs.
- Confirm the session cookie is `HttpOnly`, `Secure`, `SameSite=Lax`
  (T-011 already configured).

### E2E
- `tests/e2e/specs/security/L2-42.transport-storage.spec.ts`:
  - Probes HSTS response header on a production-mode run.
  - Attempts HTTP request and asserts redirect to HTTPS.
  - Inspects `localStorage` / `sessionStorage` after sign-in; asserts no
    credential-shaped content.
  - API-side unit test (`tests/api/AuthEndpointsTests.cs` from T-011)
    asserts stored hashes cannot be trivially reversed.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/security/L2-42.transport-storage.spec.ts`:
  - `[L2-42] HTTP requests are redirected to HTTPS and HSTS is present`
  - `[L2-42] no credential-shaped content exists in localStorage or sessionStorage after sign-in`
  - `[L2-42] stored password hashes are non-reversible (unit)`

## Folder-structure pointers

- `src/api/Program.cs`
- `src/api/Auth/PasswordHasher.cs`
- `tests/e2e/specs/security/L2-42.transport-storage.spec.ts`

## Definition of Done

- [ ] Spec passes across all browsers against a production-mode build
      with HTTPS enabled.
- [ ] HSTS header present in production responses.
- [ ] No credentials in client-side storage — only the HttpOnly cookie.
- [ ] Password hashing uses a modern KDF with per-user salt.
