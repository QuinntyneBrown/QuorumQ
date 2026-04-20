# T-022 — SignalR hub + realtime client

**Traces to:** L1-07 / L2-19
**Depends on:** T-015, T-020
**Primary area:** full stack
**Design refs:** `docs/designs/12-errors-empty-states.md`, `docs/designs/13-notifications.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Hubs/SessionHub.cs`), §5.1 (`core/realtime/`)
**Status:** Open

## Goal

Suggestion additions, votes, state transitions, and comments propagate to
every team member's device within 2 seconds without manual refresh. The
client shows a non-intrusive "Reconnecting…" indicator when disconnected
and resyncs state on reconnect.

## Scope

### Backend — `src/api/Hubs/SessionHub.cs`
- `OnConnectedAsync`: reads `?sessionId=` from query string; verifies
  membership via T-015 policy; joins the group `session-{sessionId}`.
- Hub methods are minimal — the hub is primarily a broadcast channel:
  - `Ping()` for latency probes.
- Server publishes typed events via strongly-typed client interface
  `ISessionHubClient`:
  - `SuggestionAdded`, `SuggestionWithdrawn`,
  - `VoteChanged`,
  - `CommentAdded`, `CommentEdited`, `CommentDeleted`,
  - `StateChanged`, `Decided` (with winner),
  - `PresenceChanged` (T-023 consumer).
- Every endpoint that mutates session state must publish the matching
  hub event within the same transaction boundary (via `IHubContext`).

### Frontend — `src/web/projects/app/src/app/core/realtime/session-hub.client.ts`
- Thin wrapper around `@microsoft/signalr` `HubConnection`.
- `connect(sessionId)` returns an object with `on<Event>(cb)` methods.
- Backoff/reconnect using SignalR defaults; exposes an `isConnected`
  signal consumed by the shell to render a "Reconnecting…" pill (uses
  `@components/…` surface — small inline Material `MatChip`).
- On reconnect, calls `GET /sessions/:id` to resync the full session
  snapshot.

### Test hooks
- Add dev-only endpoint `POST /_test/advance-time` gated by
  `environment.e2eHooks` (used by T-021). Kept in
  `Endpoints/TestEndpoints.cs` and wired only when
  `builder.Configuration["E2E:Hooks"] == "true"`.

### Rules
- Zero third-party realtime library beyond `@microsoft/signalr` on the
  client and the built-in `SignalR` server package (L2-47).
- No polling fallback — SignalR handles transport negotiation.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/realtime/L2-19.real-time-updates.spec.ts`:
  - `[L2-19] two members on the same session see each other's suggestion within 2 s`
  - `[L2-19] two members on the same session see each other's vote within 2 s`
  - `[L2-19] device that loses connection shows "Reconnecting…" and resyncs on reconnect`

Use `tests/e2e/support/realtime.ts` helpers (from T-004) to open two
browser contexts.

## Folder-structure pointers

- `src/api/Hubs/SessionHub.cs`
- `src/api/Endpoints/TestEndpoints.cs` (dev/e2e only)
- `src/web/projects/app/src/app/core/realtime/session-hub.client.ts`
- `tests/e2e/specs/realtime/L2-19.real-time-updates.spec.ts`

## Definition of Done

- [ ] Two browser contexts reflect the same session within 2 s on every
      event type (vote, suggestion, comment, state change).
- [ ] Reconnecting indicator appears within 3 s of transport loss and
      disappears upon resync.
- [ ] Hub refuses connections to sessions the user is not a member of
      (T-015).
- [ ] No polling loops or setInterval-based state fetchers added.
