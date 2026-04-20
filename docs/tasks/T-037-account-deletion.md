# T-037 — Account deletion

**Traces to:** L1-16 / L2-43
**Depends on:** T-014, T-038 (settings shell)
**Primary area:** full stack
**Design refs:** `docs/designs/10-screens-settings.md`, `docs/designs/11-dialogs.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/settings/`), §4

## Goal

A signed-in user can delete their account. Their profile is deleted or
anonymized; their past votes and comments are anonymized to "former member"
within 30 days.

## Scope

### Backend
- `DELETE /auth/me` — authenticated. Runs in a single transaction:
  1. Sets `User.DeletedAt = now`, scrubs `Email`, `DisplayName`,
     `AvatarUrl`.
  2. Anonymizes authored content: comments/reviews/suggestions keep their
     `UserId` but the user row is soft-deleted and query filters (T-010)
     hide it behind a read-side "former member" sentinel DTO.
  3. Clears auth cookie and returns 204.
- A hosted task (extends `SessionDeadlineWorker` OR a tiny new worker; if
  new, keep it in the same `Data/` folder to avoid new top-level
  structure — L2-47 / L2-48): 30 days after `DeletedAt`, hard-deletes the
  `User` row after ensuring all children have been anonymized.

### Frontend — `features/settings/delete-account.page.ts`
- Destructive-styled section within Settings (T-038).
- Two-step confirmation: primary button opens `@components/confirm-dialog`
  with `destructive: true`; user must type their email to confirm.
- On success, shows a farewell screen and routes to the landing page.

### E2E
- `tests/e2e/pages/` add `account-settings.page.ts` with
  `deleteAccount(confirmationEmail)`, `expectAccountGone()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/security/L2-43.account-deletion.spec.ts`:
  - `[L2-43] user confirms deletion; identifying info is removed and they are signed out`
  - `[L2-43] after deletion, their past comments display "former member"`
  - `[L2-43] after deletion, API calls with the old session cookie return 401`

## Folder-structure pointers

- `src/api/Endpoints/AuthEndpoints.cs` (extended) — contains the
  `DELETE /auth/me` endpoint.
- `src/web/projects/app/src/app/features/settings/delete-account.page.ts`
- `tests/e2e/specs/security/L2-43.account-deletion.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Destructive confirm dialog requires typing the email.
- [ ] Past comments/reviews display "former member" attribution.
- [ ] Hard-delete scheduled at +30 days.
- [ ] No plaintext PII retained after soft delete (verify in `AppDbContext`
      query filter).
