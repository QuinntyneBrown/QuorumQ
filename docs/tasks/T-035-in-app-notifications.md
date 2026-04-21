# T-035 — In-app notifications

**Traces to:** L1-15 / L2-39
**Depends on:** T-009, T-022, T-021
**Primary area:** full stack
**Design refs:** `docs/designs/13-notifications.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/notifications/`)
**Status:** Complete

## Goal

Team members receive in-app notifications for: session started, voting
started, 5 minutes remaining, session decided. A toast appears for members
not currently viewing the session, with a deep link; members on the session
see inline milestone cues instead of redundant toasts.

## Scope

### Backend
- Extend `SessionDeadlineWorker` (T-021) to fire a "5 minutes remaining"
  event when `now + 5min >= Deadline` and the event hasn't already fired
  (idempotency flag on `LunchSession`).
- Hub events: `session.started`, `session.votingStarted`,
  `session.fiveMinutes`, `session.decided` — already largely emitted by
  earlier tasks; this task ensures the `fiveMinutes` one is added.
- `POST /notifications/:id/read` — marks a notification read (for future
  in-app bell, optional for this task).
- Persist notifications in the `Notification` table (T-010) so they
  survive disconnect (best-effort; the UI consumes live events primarily).

### Frontend — `features/notifications/`
- Hub subscriber hooked into the app-level `core/realtime/` lifecycle:
  - When the hub fires one of the four notification events AND the user
    is **not** on the target session page, call `NotificationService.show`
    with a deep link.
  - When the user IS on the session page, skip the toast (L2-39:
    milestones are surfaced inline).
- Inline milestone surfacing: add a subtle banner inside `session.page.ts`
  when `fiveMinutes` fires, using `@components/card` + an icon.

### E2E
- `tests/e2e/pages/components/toast.component.ts` reused from T-009.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/notifications/L2-39.in-app.spec.ts`:
  - `[L2-39] member not on the session sees a toast with deep link when a session starts`
  - `[L2-39] member not on the session sees a toast when the session is decided`
  - `[L2-39] member on the session sees the 5-minute milestone inline, not as a toast`

## Folder-structure pointers

- `src/api/Data/SessionDeadlineWorker.cs` (extended)
- `src/web/projects/app/src/app/features/notifications/` (hub subscriber,
  milestone banner)
- `tests/e2e/specs/notifications/L2-39.in-app.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Toasts fire exactly once per event, per user.
- [ ] Deep-link action opens the target session.
- [ ] Inline milestone banner appears only for users on the session page.
- [ ] Live-region mirroring of every toast (T-009) retained.
