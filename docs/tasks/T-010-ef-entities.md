# T-010 — EF Core entities + initial migration

**Traces to:** L1-01, L1-02, L1-03, L1-04, L1-05, L1-06, L1-14, L1-16 /
L2-44, L2-47, L2-48
**Depends on:** T-002
**Primary area:** backend (data)
**Design refs:** —
**Folder structure:** `docs/folder-structure.md` §4 (`Data/`, `Models/`)

## Goal

Define every persistence entity the product needs in a single `DbContext`
and ship the initial migration. Models are shared between persistence and
API contracts; DTOs that diverge are co-located in `Models/`.

## Scope

### `src/api/Models/` (one file per type)
- `User` — `Id`, `Email` (unique, lower-cased), `PasswordHash`,
  `DisplayName`, `AvatarUrl?`, `EmailVerifiedAt?`, `CreatedAt`,
  `DeletedAt?` (soft delete for L2-43).
- `Team` — `Id`, `Name (3–50)`, `Description?`, `OwnerId`, `CreatedAt`.
- `Membership` — `UserId`, `TeamId`, `Role (Owner|Admin|Member)`,
  `JoinedAt`. Composite key.
- `Invite` — `Id`, `TeamId`, `Token` (opaque), `ExpiresAt`, `RevokedAt?`,
  `CreatedBy`.
- `Restaurant` — `Id`, `TeamId`, `Name`, `Cuisine?`, `Address?`,
  `WebsiteUrl?`, `CreatedBy`, `CreatedAt`.
- `LunchSession` — `Id`, `TeamId`, `State (Suggesting|Voting|Decided|Cancelled)`,
  `Deadline`, `TieBreakDeadline?`, `StartedBy`, `StartedAt`, `DecidedAt?`,
  `WinnerSuggestionId?`, `WinnerChosenAtRandom`.
- `Suggestion` — `Id`, `SessionId`, `RestaurantId`, `SuggestedBy`,
  `CreatedAt`, `WithdrawnAt?`.
- `Vote` — `Id`, `SessionId`, `SuggestionId`, `UserId`, `CastAt`.
  Unique index `(SessionId, UserId)` enforced at DB level (L2-13).
- `Comment` — `Id`, `SessionId`, `SuggestionId`, `UserId`, `Body (1–500)`,
  `CreatedAt`, `EditedAt?`, `DeletedAt?`.
- `Review` — `Id`, `SessionId`, `RestaurantId`, `UserId`, `Rating (1–5)`,
  `Body?`, `CreatedAt`, `UpdatedAt?`. Unique `(SessionId, UserId)`.
- `NotificationPreference` — `UserId`, `TeamId`, `Muted`. Composite key.
- `Notification` — `Id`, `UserId`, `TeamId`, `SessionId?`, `Kind`,
  `Payload (JSON)`, `CreatedAt`, `ReadAt?`.

### `src/api/Data/AppDbContext.cs`
- `DbSet<T>` for every entity above.
- Fluent configuration co-located in `OnModelCreating` (no separate
  `IEntityTypeConfiguration<>` files unless one entity's config exceeds
  ~40 lines — L2-47).
- Unique indexes: `User.Email`, `(Vote.SessionId, Vote.UserId)`,
  `(Review.SessionId, Review.UserId)`, `(NotificationPreference.UserId,
  TeamId)`.
- Soft-delete query filters for `User` (and nothing else) to satisfy
  L2-43 without bleeding complexity elsewhere.

### `src/api/Data/Migrations/`
- `0001_Initial.cs` generated via `dotnet ef migrations add`.
- `appsettings.Development.json` configures a SQLite file DB; production
  config left empty (filled by deployment).

### `src/api/Data/SeedData.cs`
- Idempotent dev seeder that creates two demo users, a demo team, and one
  decided session so the app is not empty when running locally. Gated by
  `Environment.IsDevelopment()` (never runs in production or test).

### Rules
- One `DbContext`. No repository or unit-of-work abstraction (L2-44/47).
- Entities and DTOs live in the same `Models/` folder; request/response
  DTOs are added alongside each endpoint group by later tasks.

## ATDD — Failing tests first (L2-35)

No user-facing L2 is unlocked by this task alone. Add:
- `tests/api/AppDbContextSchemaTests.cs` (integration test project; create
  only if not already present — T-002 may have deferred this):
  - `[schema] unique indexes are present on votes and reviews`
  - `[schema] soft-deleted users are filtered by default`

Keep the tests project minimal per L2-47. Placing them in
`tests/api/` is permitted by `docs/folder-structure.md` §4 ("introduced
only when a requirement demands coverage that E2E cannot reach").

## Folder-structure pointers

- `src/api/Models/*.cs`
- `src/api/Data/AppDbContext.cs`
- `src/api/Data/Migrations/`
- `src/api/Data/SeedData.cs`

## Definition of Done

- [ ] `dotnet ef migrations add Initial -p src/api` produces the migration.
- [ ] `dotnet ef database update` creates the schema from a clean DB.
- [ ] SeedData populates two users, a team, and a decided session in Dev.
- [ ] Unique indexes enforce one vote and one review per user per session.
- [ ] No `Services/`, `Repositories/`, or pipeline abstractions introduced
      (L2-47).
