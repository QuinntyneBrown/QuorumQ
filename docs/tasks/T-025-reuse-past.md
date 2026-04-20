# T-025 — Reuse past restaurants (autocomplete)

**Traces to:** L1-03, L1-14 / L2-11
**Depends on:** T-024
**Primary area:** full stack
**Design refs:** `docs/designs/07-screens-session.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/suggestions/restaurant-autocomplete.component.ts`)

## Goal

Within the suggestion form, a search field autocompletes from restaurants
previously suggested by the team. Matches appear within 300 ms of typing ≥
2 characters. Selecting an entry prefills name, cuisine, address.

## Scope

### Backend
- `GET /teams/:id/restaurants?query=<q>&limit=10` — prefix/substring
  match on `Restaurant.Name` scoped to team; orders by most recently
  suggested first; returns 10 rows max.
- `.RequireTeamMembership()`.

### Frontend — `features/suggestions/restaurant-autocomplete.component.ts`
- Material `matAutocomplete` attached to the name input of the
  suggestion form.
- Debounce 200 ms; cancels in-flight requests on newer keystrokes.
- On select, patches the sibling cuisine/address/website fields.
- Accessible: options are `role="option"` with unique `aria-labelledby`.

### E2E — `tests/e2e/pages/suggestions/suggestion-form.page.ts`
- Extend with `typeNameQuery(q)`, `expectAutocompleteOptions(names[])`,
  `selectAutocomplete(name)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/suggestions/L2-11.reuse-past.spec.ts`:
  - `[L2-11] typing 2 chars shows matching past restaurants within 300 ms`
  - `[L2-11] selecting an autocomplete entry prefills name, cuisine, and address`

## Folder-structure pointers

- `src/api/Endpoints/SuggestionEndpoints.cs` (extended) or
  `Endpoints/RestaurantEndpoints.cs` if the count grows — keep it
  together for now (L2-47).
- `src/web/projects/app/src/app/features/suggestions/restaurant-autocomplete.component.ts`
- `tests/e2e/specs/suggestions/L2-11.reuse-past.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] 95th-percentile response time for the autocomplete endpoint ≤
      200 ms against the seeded dev DB.
- [ ] Autocomplete options focusable and selectable via keyboard only.
- [ ] Results scoped strictly to the user's team (verify with a
      negative test that restaurants from another team never appear).
