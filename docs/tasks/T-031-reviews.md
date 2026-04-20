# T-031 — Review the winner

**Traces to:** L1-06, L1-14 / L2-17
**Depends on:** T-029
**Primary area:** full stack
**Design refs:** `docs/designs/08-screens-restaurant.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/ReviewEndpoints.cs`), §5.1 (`features/reviews/`)
**Folder structure:** Open

## Goal

After a session is `Decided`, participating members can rate the winning
restaurant 1–5 stars and optionally leave a written review. One review per
session per user; submitting again replaces the previous one. Non-participants
cannot review.

## Scope

### Backend — `src/api/Endpoints/ReviewEndpoints.cs`
- `PUT /sessions/:id/review` — body `{ rating (1–5), body? }`.
  - Requires `session.State == Decided` AND caller participated
    (had a vote OR suggestion in the session — the acceptance criteria
    say "participating member").
  - Upserts `Review` against the unique `(SessionId, UserId)` from T-010.
  - Recomputes `Restaurant.AverageRating` (simple average cached on the
    entity — kept inline per L2-47, not a separate aggregator service).
- `GET /restaurants/:id/reviews` — list with dates, authors, redacted
  for deleted users (L2-43).

### Frontend — `features/reviews/review-form.component.ts`
- Material star rating built from `matIcon`s + keyboard arrow-key
  support.
- Shown on:
  - Winner reveal (T-029) as a secondary action.
  - Restaurant profile (T-032).
- Disabled with an explanatory tooltip for non-participants.

### E2E — `tests/e2e/pages/restaurants/restaurant-profile.page.ts`
- Add `leaveReview(stars, body?)`, `expectReviewFormUnavailable()`,
  `expectAverageRating(stars)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/comments/L2-17.review.spec.ts`:
  - `[L2-17] participating member submits 1–5 star rating; average updates`
  - `[L2-17] re-submitting replaces the previous review for the same visit`
  - `[L2-17] non-participant does not see a review form`

## Folder-structure pointers

- `src/api/Endpoints/ReviewEndpoints.cs`
- `src/web/projects/app/src/app/features/reviews/review-form.component.ts`
- `tests/e2e/specs/comments/L2-17.review.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Unique index enforces one review per user per session (L2-10).
- [ ] Average rating reflects the upsert immediately.
- [ ] Rating widget fully keyboard-accessible (arrow keys + Space/Enter).
