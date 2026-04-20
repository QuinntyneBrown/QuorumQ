# T-036 — Notification preferences

**Traces to:** L1-15 / L2-40
**Depends on:** T-035, T-038
**Primary area:** full stack
**Design refs:** `docs/designs/10-screens-settings.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/settings/`), §4

## Goal

A user can mute notifications per team. Muted teams send no notifications
until re-enabled.

## Scope

### Backend
- `GET /notification-preferences` — returns array of `{ teamId, muted }`
  for every team the user is a member of.
- `PUT /notification-preferences/:teamId` — body `{ muted }`. Upserts
  `NotificationPreference`.
- Every notification emitter checks the preference before pushing to a
  user. Kept as a tiny inline check in the endpoint/worker — no separate
  `NotificationService` abstraction (L2-47).

### Frontend — `features/settings/notification-settings.page.ts`
- Rendered inside the Settings screen (T-038) as a tab/section.
- Lists every team the user belongs to with a Material `matSlideToggle`
  per team labelled "Mute notifications".
- Uses `NotificationService` (T-009) to confirm the save with a polite
  announcement.

### E2E
- `tests/e2e/pages/` — add `notification-settings.page.ts` with
  `muteTeam(name)`, `unmuteTeam(name)`, `expectMuted(name, bool)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/notifications/L2-40.preferences.spec.ts`:
  - `[L2-40] user disables notifications for a team; subsequent events produce no toasts for that team`
  - `[L2-40] re-enabling notifications restores delivery`

## Folder-structure pointers

- `src/api/Endpoints/` — add `NotificationEndpoints.cs` (single file)
- `src/web/projects/app/src/app/features/settings/notification-settings.page.ts`
- `tests/e2e/specs/notifications/L2-40.preferences.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Muting is effective immediately (no reload required).
- [ ] Preference persists across sessions and devices (server-side).
- [ ] Toggle accessible via keyboard with a clear on/off announcement.
