# T-015 — Team membership authorization policy

**Traces to:** L1-16 / L2-41
**Depends on:** T-010, T-011
**Primary area:** backend
**Design refs:** —
**Folder structure:** `docs/folder-structure.md` §4 (`Auth/TeamMembershipPolicy.cs`)

## Goal

Centralise the rule that a user may only read or write data belonging to
teams they are a member of. Every team-scoped endpoint plugs into this one
policy, and every SignalR hub method enforces it.

## Scope

### `src/api/Auth/TeamMembershipPolicy.cs`
- Custom authorization requirement: `TeamMembershipRequirement`.
- Handler resolves the team id from the route (`teamId`), resource
  (e.g. `SessionId → SessionEntity.TeamId`), or hub invocation argument,
  and checks the caller is listed in `Memberships` for that team.
- Optional role check: `[RequireTeamMembership(Role = "Owner")]` used by
  team admin-only endpoints.

### `src/api/Program.cs`
- Registers the policy under the name `"TeamMember"`.
- Adds a minimal `EndpointFilter` that, when an endpoint is tagged with
  `.RequireTeamMembership()` (extension), runs the policy.

### SignalR
- `Hubs/SessionHub.cs` — base `OnConnectedAsync` reads the requested
  `teamId` from query/headers and rejects the connection on mismatch.
  Hub methods additionally assert membership for each `sessionId` they
  accept.

### Rules
- No team-scoped endpoint may rely on in-endpoint ad-hoc checks — all
  authorization goes through this policy (L2-47 / L2-41).
- 403 is returned with a `ProblemDetails` that exposes no data (L2-41).

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/security/L2-41.team-isolation.spec.ts`:
  - `[L2-41] non-member cannot read another team's session via the UI`
  - `[L2-41] non-member API calls to /teams/:id/sessions return 403 with no payload`
  - `[L2-41] hub refuses to join a team the user is not a member of`

Page object: `tests/e2e/pages/teams/team-dashboard.page.ts` (introduced by
T-019; this task only adds security coverage atop what exists).

## Folder-structure pointers

- `src/api/Auth/TeamMembershipPolicy.cs`
- `src/api/Hubs/SessionHub.cs` (extended)

## Definition of Done

- [ ] Every team-scoped endpoint registered in T-016 … T-035 uses
      `.RequireTeamMembership()`.
- [ ] Hub connection refused on unauthorized team.
- [ ] 403 response body contains no identifying data about the other team.
- [ ] Failing spec added first; passes on all four browser projects.
- [ ] No duplicated authorization logic in endpoint handlers (L2-47).
