# T-023 — Presence

**Traces to:** L1-07 / L2-20
**Depends on:** T-022
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/sessions/`)
**Status:** Open

## Goal

The session screen shows avatars of members currently viewing the session
with a subtle "online" indicator. Presence is cleared within 30 seconds
after a member closes the session screen.

## Scope

### Backend
- Extend `SessionHub`:
  - Maintains per-session group presence in a concurrent dictionary
    keyed by `sessionId → HashSet<userId>`.
  - On `OnConnectedAsync`, `OnDisconnectedAsync`, and on an explicit
    `LeaveSession()` hub method, emits `PresenceChanged(sessionId,
    presentUserIds)`.
  - A 30-second grace timer removes a user after their last connection
    closes (L2-20). Implemented with a simple `Timer` + cancellation
    per user.
- `GET /sessions/:id/presence` returns the current snapshot (used by
  the client on first load to prime the UI before the hub event).

### Frontend
- `features/sessions/presence.component.ts`:
  - Subscribes to hub `PresenceChanged`.
  - Renders a row of `@components/avatar` with
    `@components/presence-indicator` beside each.
  - Overflow count ("+N") via Material `matBadge` for > 5 present.

### E2E
- `tests/e2e/pages/components/presence.component.ts` with
  `expectPresent(userNames[])`, `expectCountOverflow(n)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/realtime/L2-20.presence.spec.ts`:
  - `[L2-20] members present on the session appear as avatars with an online indicator`
  - `[L2-20] when a member closes the session screen their avatar is cleared within 30 s`

## Folder-structure pointers

- `src/api/Hubs/SessionHub.cs` (extended)
- `src/api/Endpoints/SessionEndpoints.cs` (adds `GET /:id/presence`)
- `src/web/projects/app/src/app/features/sessions/presence.component.ts`
- `tests/e2e/specs/realtime/L2-20.presence.spec.ts`

## Definition of Done

- [ ] Failing spec added first; passes across all browsers.
- [ ] Presence clears within 30 s after disconnect (verify with Playwright
      fake timers and test-only time helpers).
- [ ] Avatars are themed and keyboard-focusable with a name tooltip.
- [ ] Overflow badge appears at > 5 present users.
