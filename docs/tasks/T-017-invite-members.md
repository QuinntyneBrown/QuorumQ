# T-017 — Invite members to a team

**Traces to:** L1-01, L1-16 / L2-02
**Depends on:** T-016
**Primary area:** full stack
**Design refs:** `docs/designs/06-screens-team.md`, `docs/designs/11-dialogs.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/teams/`), §4
**Status:** Open

## Goal

A team Owner or Admin generates a shareable invite link with an expiring
token. An authenticated non-member opening the link is prompted to join and,
upon accepting, becomes a `Member`. Expired or revoked links show a
dedicated error surface.

## Scope

### Backend
- `POST /teams/:id/invites` — creates `Invite` with a cryptographically
  random `Token`, default expiry 7 days. `.RequireTeamMembership(Role in
  Owner|Admin)`. Returns the full URL (host configured via
  `AuthOptions.PublicBaseUrl`).
- `GET /invites/:token` — resolves to team preview (name, member count).
  Public (no auth) but rate-limited to avoid enumeration.
- `POST /invites/:token/accept` — authenticated; creates `Membership` with
  role `Member`; atomic insert; idempotent if already a member.
- `POST /invites/:id/revoke` — sets `RevokedAt`; Owner/Admin only.

### Frontend — `features/teams/`
- `team-invite.page.ts`:
  - Lists active invites (token truncated, expiry, copy-to-clipboard
    button using Material `MatSnackBar` through `NotificationService`
    [T-009]).
  - "Generate invite" button; result appears in the list.
  - "Revoke" inline action with confirm dialog (`@components/confirm-dialog`).
- `accept-invite.page.ts` mounted at `/invites/:token`:
  - Loads invite preview; if expired/revoked, shows the
    "Invite no longer valid" empty state (`@components/empty-state`)
    with a "Contact your team" CTA (mailto link).
  - If user is not authenticated, routes to sign-in with `return=/invites/:token`.
  - Accept CTA calls `POST /invites/:token/accept`, then navigates to
    `/teams/:id`.

### E2E — `tests/e2e/pages/teams/`
- `team-invite.page.ts` with `generateInvite()`, `copyInviteLink()`,
  `revokeInvite(index)`.
- `accept-invite.page.ts` with `acceptInvite()`, `expectInviteInvalid()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/team-membership/L2-02.invite-members.spec.ts`:
  - `[L2-02] Owner generates an invite link with an expiring token`
  - `[L2-02] authenticated non-member opens a valid link and joins as Member`
  - `[L2-02] expired or revoked link shows an "Invite no longer valid" surface`

## Folder-structure pointers

- `src/api/Endpoints/TeamEndpoints.cs` (invites grouped here)
- `src/web/projects/app/src/app/features/teams/team-invite.page.ts`
- `src/web/projects/app/src/app/features/teams/accept-invite.page.ts`
- `tests/e2e/specs/team-membership/L2-02.invite-members.spec.ts`

## Definition of Done

- [ ] Invite tokens are cryptographically random and stored as-is (they
      are capability tokens, not secrets to hash).
- [ ] Owner/Admin-only for generate/revoke (enforced by T-015 policy).
- [ ] Copy-to-clipboard announces success to the live region (T-009).
- [ ] Expired/revoked and unknown tokens all render the same "invalid"
      surface (no enumeration — L2-41 spirit).
- [ ] Spec passes on all four browser projects.
