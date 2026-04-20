# T-002 — .NET API project skeleton

**Traces to:** L1-17, L1-18 / L2-44, L2-47, L2-48
**Depends on:** T-001
**Primary area:** backend
**Design refs:** —
**Folder structure:** `docs/folder-structure.md` §4
**Status:** Open

## Goal

Stand up the single ASP.NET Core Web API project — minimal APIs, no
speculative layering, OpenAPI in Development only.

## Scope

### Backend (`src/api/`)
- Create `Api.csproj` targeting the current .NET LTS.
- `Program.cs` as composition root:
  - Configures JSON, problem details, HTTPS redirection, HSTS in
    non-development, CORS for local Angular dev origin.
  - Registers `AppDbContext` (placeholder SQLite / LocalDB — choose the
    simplest that works cross-platform; configured in
    `appsettings.Development.json`).
  - Exposes OpenAPI via Swashbuckle **only when Environment is Development**
    (L2-44).
  - Registers endpoint groups — each `Endpoints/*.cs` file exposes a static
    `Map<Resource>Endpoints(this IEndpointRouteBuilder app)` that `Program.cs`
    calls.
  - Registers SignalR and maps `/hubs/session` (placeholder hub — filled in
    by T-022).
- `appsettings.json` + `appsettings.Development.json`.
- `Endpoints/` folder with empty placeholders: `AuthEndpoints.cs`,
  `TeamEndpoints.cs`, `SessionEndpoints.cs`, `SuggestionEndpoints.cs`,
  `VoteEndpoints.cs`, `CommentEndpoints.cs`, `ReviewEndpoints.cs`,
  `HistoryEndpoints.cs`. Each file defines its static extension method that
  currently maps nothing.
- `Hubs/SessionHub.cs` — empty `Hub` subclass.
- `Data/AppDbContext.cs` — empty `DbContext`; `DbSet`s added by T-010.
- `Data/SeedData.cs` — no-op seeder (extended by later tasks).
- `Models/` — empty folder (entities added by T-010).
- `Auth/AuthOptions.cs` + `Auth/TeamMembershipPolicy.cs` — stubs only
  (authentication fleshed out by T-011, authorization policy by T-015).
- `wwwroot/` — empty (may host Angular output in production builds).

### Root
- Add `src/api/Api.csproj` to `QuorumQ.sln`.
- `GET /health` endpoint returning `200 OK` with `{ "status": "ok" }`.

## ATDD — Failing tests first (L2-35)

This task defines no new L2 requirement test, but guarantees the API starts.
Add one smoke test under `tests/e2e/specs/_smoke/api-up.spec.ts`:
- `[smoke] API /health returns 200` — hits the API via
  `tests/e2e/support/api-client.ts`.

## Folder-structure pointers

- `src/api/Program.cs`
- `src/api/Endpoints/*.cs`
- `src/api/Hubs/SessionHub.cs`
- `src/api/Data/AppDbContext.cs`
- `src/api/Models/` (empty)
- `src/api/Auth/*.cs`

## Definition of Done

- [ ] `dotnet run --project src/api` starts and `/health` returns 200.
- [ ] `/swagger` is reachable in Development and absent in Production
      (L2-44).
- [ ] No `Services/`, `Application/`, `Domain/`, `Infrastructure/` folders
      introduced (L2-44, L2-47).
- [ ] Solution file references exactly one project (`Api.csproj`).
- [ ] OpenAPI JSON document generated at `/openapi/v1.json` in Development
      (consumed by T-003 / the Angular `openapi-typescript` pipeline).
