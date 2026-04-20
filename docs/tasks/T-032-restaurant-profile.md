# T-032 — Restaurant profile

**Traces to:** L1-06, L1-14 / L2-18
**Depends on:** T-031
**Primary area:** full stack
**Design refs:** `docs/designs/08-screens-restaurant.md`, `docs/designs/12-errors-empty-states.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/history/restaurant-profile.page.ts`)

## Goal

Tapping a restaurant name anywhere in the app opens a profile showing
details, aggregate rating, and historical reviews with dates and authors. A
restaurant with no reviews shows an empty state encouraging the team to pick
it.

## Scope

### Backend
- `GET /teams/:id/restaurants/:restaurantId` — returns `{ restaurant,
  averageRating, reviewCount, reviews[] }`. `.RequireTeamMembership()`.

### Frontend — `features/history/restaurant-profile.page.ts`
- Route: `/teams/:teamId/restaurants/:restaurantId`.
- Header card: name, cuisine, address, website link, average rating.
- Reviews list: `@components/card` per review with date, author avatar,
  stars, body.
- Empty state via `@components/empty-state` when no reviews, with a CTA
  "Suggest next lunch" that links to `/teams/:id/sessions/new` (T-020).
- Entry point: every restaurant name rendered in the app (suggestion
  list, winner reveal, history) is a router link to this profile.

### E2E — `tests/e2e/pages/restaurants/restaurant-profile.page.ts`
- Add `expectAverageRating()`, `expectReviewCount(n)`,
  `expectEmptyState()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/comments/L2-18.restaurant-profile.spec.ts`:
  - `[L2-18] tapping a restaurant opens the profile with details, average rating, and reviews`
  - `[L2-18] restaurant with no reviews shows an empty state with a CTA`

## Folder-structure pointers

- `src/api/Endpoints/ReviewEndpoints.cs` (extended) or
  `RestaurantEndpoints.cs` — keep together in a single
  `ReviewEndpoints.cs` for now (L2-47).
- `src/web/projects/app/src/app/features/history/restaurant-profile.page.ts`
- `tests/e2e/specs/comments/L2-18.restaurant-profile.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Every restaurant name in the app links to the profile.
- [ ] Empty state keyboard-navigable with visible focus.
- [ ] Average rating matches server aggregate.
