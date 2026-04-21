# T-024 — Suggest a restaurant

**Traces to:** L1-03 / L2-10
**Depends on:** T-021, T-022
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/SuggestionEndpoints.cs`), §5.1 (`features/suggestions/`)
**Status:** Assigned

## Goal

During `Suggesting`, any team member adds a restaurant by name, address,
cuisine, and optional link. Submissions appear in the suggestion list in
real time for all members. Duplicate names are short-circuited with an
"upvote existing" CTA.

## Scope

### Backend — `src/api/Endpoints/SuggestionEndpoints.cs`
- `POST /sessions/:id/suggestions` — body `{ name (2–80), cuisine?,
  address?, websiteUrl? }`.
  - Creates or reuses `Restaurant` scoped to the team, then inserts
    `Suggestion`.
  - Enforces no duplicate suggestion (same `RestaurantId`) per session;
    on duplicate, returns `409 Conflict` with `{ existingSuggestion,
    suggestedBy }`.
  - Emits `SuggestionAdded` on the hub.
  - `.RequireTeamMembership()`.
  - Rejects when `session.State != Suggesting` with `409`.
- `GET /sessions/:id/suggestions` — list with vote counts (vote counts
  are zero until T-027).

### Frontend — `features/suggestions/`
- `suggest-restaurant.component.ts`:
  - Compact Material form rendered as a `mat-expansion-panel` on mobile
    and a sticky right-column form on desktop.
  - On `409`, inline banner: "Already suggested by <name>" with an
    "Upvote" CTA that delegates to T-027 (no-op until that task lands).
- `suggestion-list.component.ts`:
  - List of `@components/card` per suggestion showing name, cuisine,
    suggester avatar, vote count (zero until T-027), actions row
    (`Vote`, `Withdraw`, `Comment` — disabled based on session state).
  - Subscribes to `SuggestionAdded` / `SuggestionWithdrawn` via
    `core/realtime/session-hub.client.ts`.
- Wire both into `session.page.ts`.

### Rules
- When `session.State != Suggesting`, the submission form is disabled
  with an explanation.
- Trim + case-fold names for duplicate detection.

### E2E — `tests/e2e/pages/suggestions/suggestion-form.page.ts`
- `suggestRestaurant({ name, cuisine?, address?, websiteUrl? })`,
  `expectAlreadySuggested(by)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/suggestions/L2-10.suggest-restaurant.spec.ts`:
  - `[L2-10] member submits a restaurant during Suggesting and all members see it in real time`
  - `[L2-10] duplicate name triggers an "Already suggested" message with an upvote CTA`
  - `[L2-10] suggestion form is disabled when session is not in Suggesting state`

## Folder-structure pointers

- `src/api/Endpoints/SuggestionEndpoints.cs`
- `src/web/projects/app/src/app/features/suggestions/suggest-restaurant.component.ts`
- `src/web/projects/app/src/app/features/suggestions/suggestion-list.component.ts`
- `tests/e2e/specs/suggestions/L2-10.suggest-restaurant.spec.ts`

## Definition of Done

- [ ] Failing Playwright spec first; passes on all browsers.
- [ ] Duplicate detection is case-insensitive and punctuation-normalized.
- [ ] Two contexts observe the same suggestion within 2 s (L2-19
      regression guard).
- [ ] Form disabled outside `Suggesting` state.
