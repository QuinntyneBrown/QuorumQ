# 08 · Restaurant Screens

**Traces to:** L2-17, L2-18

---

## 1. Restaurant profile (L2-18)

Reached by tapping a restaurant name anywhere in the app. Mobile:

```
┌───────────────────────────────────┐
│  ←  Taco Town                 ⋮   │
├───────────────────────────────────┤
│  ┌─────────────────────────────┐  │   hero (height 160 xs / 240 md),
│  │                              │ │   primary-container bg with subtle
│  │         🌮                    │ │   cuisine icon; replaced by real
│  │                              │ │   photo if available
│  └─────────────────────────────┘  │
│                                   │
│  Taco Town                        │   headline-medium, display family
│  Mexican · 123 Main St            │   body-medium (muted)
│                                   │
│  ★ 4.6                           │   title-large, tertiary
│  from 12 reviews                  │   body-small (muted)
│                                   │
│  [🚗 Directions] [🌐 Website] [📞 ]│   assist chips
│                                   │
│  ───────────────────────────────  │   divider
│                                   │
│  Reviews (12)                     │   title-medium
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 👤 Priya · 2 weeks ago      │  │
│  │ ★★★★★                       │  │
│  │ Amazing horchata, fast      │  │
│  │ service.                    │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 👤 Jordan · 3 weeks ago     │  │
│  │ ★★★★☆                       │  │
│  │ Solid tacos.                │  │
│  └─────────────────────────────┘  │
│                                   │
│  Suggested history                │   title-medium
│  · 4 times total                  │
│  · Won 2 of 4                     │
│                                   │
├───────────────────────────────────┤
│              ┌────────────────┐   │
│              │ Leave a review │   │   extended FAB when eligible
│              └────────────────┘   │   (participated in decided session)
└───────────────────────────────────┘
```

Tablet+ splits the hero + summary left, reviews right:

```
┌──────────────────────────────────────────────────────────────┐
│  ←  Taco Town                                       ⋮         │
├─────────────────────────────┬────────────────────────────────┤
│  ┌───────────────────────┐  │  Reviews (12)                  │
│  │      🌮                │  │  ┌───────────────────────┐    │
│  └───────────────────────┘  │  │ 👤 Priya · 2w          │    │
│  Taco Town                  │  │ ★★★★★                  │    │
│  Mexican · 123 Main         │  │ Amazing horchata.      │    │
│  ★ 4.6 · 12 reviews         │  └───────────────────────┘    │
│  [ Directions ] [ Website ] │  ┌───────────────────────┐    │
│  Suggested 4× · Won 2×      │  │ 👤 Jordan · 3w         │    │
│                             │  │ ★★★★☆                  │    │
│                             │  └───────────────────────┘    │
└─────────────────────────────┴────────────────────────────────┘
```

---

## 2. Restaurant with no reviews (L2-18 AC 2)

```
┌───────────────────────────────────┐
│  ←  Green Bowl                    │
├───────────────────────────────────┤
│  ...hero...                       │
│  Green Bowl                       │
│  Vegetarian · 88 Elm              │
│  ☆ No reviews yet                 │   outline color, star empty
│                                   │
│  ───────────────────────────────  │
│                                   │
│         ( empty state )           │
│                                   │
│             🌱                     │   icon-hero (secondary)
│                                   │
│  Give Green Bowl a try            │   title-medium
│  Then come back and leave the    │
│  team's first review.             │   body-medium
│                                   │
│  ┌───────────────────────────────┐│
│  │     Suggest for next lunch    ││   tonal button
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

---

## 3. Leave a review (L2-17)

Triggered from the winner-reveal "Leave a review" text button or the
restaurant profile FAB. Available only to participants of a `Decided`
session (L2-17 AC 3) — otherwise the FAB is absent.

Bottom sheet (xs):

```
┌───────────────────────────────────┐
│           ─                       │   drag handle
│                                   │
│  Review Taco Town                 │   title-large
│  After Wed, Apr 17 lunch          │   body-small (muted)
│                                   │
│  Your rating                      │   label-medium
│  ★ ★ ★ ★ ☆                       │   interactive stars, icon-lg
│  Good — very good                 │   body-medium (live), updates as stars pick
│                                   │
│  Your review (optional)           │
│  ┌───────────────────────────────┐│
│  │ They're consistently fast     ││   textarea, auto-grow
│  │ and the horchata is magic.    ││
│  │                               ││
│  └───────────────────────────────┘│
│  0 / 500                          │
│                                   │
│  ┌───────────────┐┌──────────────┐│
│  │   Cancel      ││   Submit     ││
│  └───────────────┘└──────────────┘│
└───────────────────────────────────┘
```

Submit disabled until ≥ 1 star is selected.

Replace-existing behavior (L2-17 AC 2): if the user already reviewed this
visit, the sheet loads their previous review and the submit label changes to
`Update review`.

Success → snackbar "Review saved" and the rating updates in the profile's
hero with a brief number-roll of the average.

---

## 4. Rating picker — states

```
 empty         partial hover      committed        read-only
 ☆ ☆ ☆ ☆ ☆     ★ ★ ☆ ☆ ☆         ★ ★ ★ ★ ☆        ★ ★ ★ ★ ☆
 label: "Pick a rating"  "Two stars"  "Four stars"  aria-readonly
```

Keyboard: left/right arrows change value; Home / End jump to 1 / 5; Enter
commits.

Colors: star fill `tertiary`, empty star `outline`. No color-only signal:
number of filled shapes conveys the rating.

---

## 5. Review card — states

```
own, editable within window             own, past edit window
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ 👤 Priya · 2m      ⋮        │        │ 👤 Priya · 2 weeks ago      │
│ ★★★★★                       │        │ ★★★★★                       │
│ …                           │        │ …                           │
└─────────────────────────────┘        └─────────────────────────────┘
 ⋮ menu: Edit · Delete                  (no ⋮)

from another member                     former member (after account delete)
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ 👤 Jordan · 3w              │        │ 👤 Former member · 3w       │
│ ★★★★☆                       │        │ ★★★★☆                       │
│ …                           │        │ …                           │
└─────────────────────────────┘        └─────────────────────────────┘
```

---

## 6. Angular Material components used

- `mat-toolbar`, `mat-card`, `mat-list`
- `mat-bottom-sheet` (review composer on xs), `mat-dialog` (review composer
  on md+)
- `mat-form-field` (textarea + counter)
- `mat-chip-set` (assist chips), `mat-icon-button`, `mat-fab-extended`
- Rating is a composed component: a `<fieldset role="radiogroup">` with 5
  `mat-icon-button`s representing the stars; each has
  `aria-label="N stars"` and `aria-checked`.
