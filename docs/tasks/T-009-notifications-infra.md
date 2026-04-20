# T-009 — Toast & live-region notification infrastructure

**Traces to:** L1-15 / L2-39 (infrastructure), L2-28 (shares live region)
**Depends on:** T-006, T-008
**Primary area:** frontend (app + components)
**Design refs:** `docs/designs/13-notifications.md`, `docs/designs/11-dialogs.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/notifications/`)

## Goal

Provide the single in-app notification surface used by every feature: a
snack/toast host backed by `MatSnackBar` with live-region mirroring for
screen readers. Functional notifications (session events) are wired up in
T-035.

## Scope

### `src/web/projects/app/src/app/features/notifications/`
- `notification.service.ts`:
  - `show({ kind, message, action?, duration?, deepLink? })` where
    `kind ∈ 'info' | 'success' | 'warning' | 'error'`.
  - Delegates to `MatSnackBar` with a custom panel class keyed on `kind`.
  - Mirrors the message to `LiveAnnouncer` (T-008): `polite` for
    `info`/`success`, `assertive` for `warning`/`error`.
  - Queues messages when multiple arrive simultaneously (simple array).
  - Deep links open via `Router.navigateByUrl` when the action is tapped.
- `snack.config.ts` — shared snackbar config (position: top on mobile per
  `docs/designs/13-notifications.md`; bottom on desktop).

### Components library
- No new primitive — snackbar is Material directly. If styling differs from
  default Material, add a thin `SnackPanelComponent` under
  `projects/components/src/lib/` following T-006's rules.

### Rules
- One notification service, one queue. Features never call `MatSnackBar`
  directly — they call `NotificationService.show(…)` (L2-47).
- Every notification is announced to assistive tech (L2-28).

## ATDD — Failing tests first (L2-35)

Covered by L2-39 fully in T-035. This task adds an infrastructure smoke:
- `tests/e2e/specs/_smoke/notifications.spec.ts`:
  - `[smoke] notification service emits a toast and announces it politely`
    (driven from a test-only route `/_test/notify?kind=info&msg=hi`
    guarded behind `environment.e2eHooks === true`).

Page object: `tests/e2e/pages/components/toast.component.ts` with
`awaitToast(text)` and `dismissToast()` verbs.

## Folder-structure pointers

- `src/web/projects/app/src/app/features/notifications/notification.service.ts`
- `tests/e2e/pages/components/toast.component.ts`

## Definition of Done

- [ ] `NotificationService.show` delivers a visual toast AND a live-region
      announcement (L2-28 / L2-39).
- [ ] Feature code never imports `MatSnackBar` directly (grep audit).
- [ ] Toast position follows design: top on mobile, bottom on desktop.
- [ ] Deep-link action opens the target route when tapped.
- [ ] Smoke spec passes on all four browser projects.
