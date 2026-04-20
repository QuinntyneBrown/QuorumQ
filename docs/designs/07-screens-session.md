# 07 · Lunch Session Screens

**Traces to:** L2-07, L2-08, L2-09, L2-10, L2-11, L2-12, L2-13, L2-14, L2-15,
L2-16, L2-19, L2-20

The lunch session is the core experience. It progresses through four states:

```
Suggesting  ──────►  Voting  ──────►  Decided
                                        │
                                        └── (if tied) Tie-Breaker ──► Decided

Any active state may be force-transitioned to Cancelled by the organizer.
```

Each state shares the same shell (top app bar, session hero, suggestion list,
comments) but swaps the primary action region.

---

## 1. Start lunch (L2-07)

Triggered from the dashboard FAB or "Start lunch" empty-state CTA. Opens a
bottom sheet on mobile, dialog on desktop.

```
┌───────────────────────────────────┐
│           ─                       │   drag handle
│                                   │
│   Start lunch                     │   title-large
│   Today at 12:00 PM               │   body-medium
│                                   │
│  Voting deadline                  │
│  ┌─────────────────────────────┐  │   slider + numeric input
│  │ ●────────────── 180          │  │
│  │ 5 min        30 min    3 hr  │  │
│  └─────────────────────────────┘  │
│                                   │
│  ☑  Allow comments during voting  │   checkbox (default on)
│                                   │
│  ┌───────────────┐┌──────────────┐│
│  │   Cancel      ││  Start lunch ││   outlined + filled
│  └───────────────┘└──────────────┘│
└───────────────────────────────────┘
  safe-area-inset-bottom
```

If an active session already exists (L2-07 AC 2), the button label becomes
`Open today's session` and the sheet title becomes `A lunch is already in
progress`.

---

## 2. Active session — `Suggesting` state (L2-08, L2-10)

Mobile, `xs`:

```
┌───────────────────────────────────┐
│  ←  Today's lunch          ⋮      │   ⋮ overflow menu
├───────────────────────────────────┤
│  [ Suggesting ]     opens in      │   state chip + time to voting
│                     18 : 04       │
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░  28%  │
│                                   │
│  👤 👤 👤 +4 online                │   presence stack
├───────────────────────────────────┤
│  ┌─────────────────────────────┐  │
│  │ 🔍 Suggest a restaurant     ▸ │  │   search + autocomplete entry
│  └─────────────────────────────┘  │
│                                   │
│  Suggestions · 4                  │   title-medium
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 🌮 Taco Town                │  │   suggestion card
│  │ 123 Main · Mexican          │  │
│  │ Suggested by Priya · 2m    ⋮│  │
│  │ 💬 2                        │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 🍜 Pho Forever              │  │
│  │ 55 Oak · Vietnamese         │  │
│  │ Suggested by Jordan · 5m    │  │
│  └─────────────────────────────┘  │
│                                   │
│  (…)                              │
│                                   │
├───────────────────────────────────┤
│  🏠   🍽●  🕓   👥                │
└───────────────────────────────────┘
```

Overflow ⋮ menu (organizer):

```
  ┌─────────────────────────────┐
  │  Start voting               │
  │  Invite more members        │
  │  ──────────────             │
  │  Cancel lunch       (red)   │
  └─────────────────────────────┘
```

### 2.1 Suggest a restaurant (L2-10, L2-11)

Tapping the search bar opens a full-screen sheet with autocomplete.

```
┌───────────────────────────────────┐
│  ✕   Suggest                      │
├───────────────────────────────────┤
│  Name                             │
│  ┌───────────────────────────────┐│
│  │ 🔍 Taco                       ││
│  └───────────────────────────────┘│
│  ┌───────────────────────────────┐│
│  │ 🌮 Taco Town · Mexican        ││   autocomplete list
│  │ 🌮 Taco Tuesday · Mexican     ││   (L2-11 AC 1 — within 300ms)
│  │ 🌮 El Tacorrico · Mexican     ││
│  └───────────────────────────────┘│
│                                   │
│  Or add a new one:                │
│  Cuisine                          │
│  [ Mexican ✕ ] [ Vegetarian ✕ ]+  │   chip input
│                                   │
│  Address (optional)               │
│  ┌───────────────────────────────┐│
│  │ 123 Main St                   ││
│  └───────────────────────────────┘│
│                                   │
│  Link (optional)                  │
│  ┌───────────────────────────────┐│
│  │ https://                      ││
│  └───────────────────────────────┘│
│                                   │
│  ┌───────────────────────────────┐│
│  │          Suggest              ││   filled primary
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

Duplicate handling (L2-10 AC 2):

```
 ┌────────────────────────────────────────┐
 │  ⚠  Already suggested by Jordan.       │   warning snackbar
 │  Upvote their suggestion instead?      │
 │                               UPVOTE   │
 └────────────────────────────────────────┘
```
Submit button disabled (`aria-disabled=true`) while a duplicate is detected.

### 2.2 Withdraw own suggestion (L2-12)

The suggestion's overflow menu contains `Withdraw` (own only, Suggesting state
only):

```
  ┌─────────────────────────────┐
  │  View restaurant            │
  │  Withdraw suggestion  (red) │
  └─────────────────────────────┘
```

Confirm dialog — see `11-dialogs.md §2`.

---

## 3. Active session — `Voting` state (L2-08, L2-13)

```
┌───────────────────────────────────┐
│  ←  Today's lunch          ⋮      │
├───────────────────────────────────┤
│  [ Voting ]        closes in      │
│                     12 : 34       │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  65%      │   progress turns tertiary < 1 min,
│                                   │   error < 10 s, with pulse
│  👤 👤 👤 +4 online                │
├───────────────────────────────────┤
│                                   │
│  Tap to vote (one vote each)      │   body-small, centered
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 🌮 Taco Town                │  │   suggestion card with vote button
│  │ 123 Main · Mexican          │  │
│  │ ████████████░░░░░  5 votes  │  │   vote-share bar (L2-13 + L2-25)
│  │ Suggested by Priya          │  │
│  │                     ┌──────┐│  │
│  │ 💬 2                │ Vote ││  │   outlined button (default state)
│  └─────────────────────┴──────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 🍜 Pho Forever              │  │
│  │ ████░░░░░░░░░░░░  2 votes   │  │
│  │                     ┌──────┐│  │
│  │ 💬 0                │✓Voted││  │   tonal (= my current vote)
│  └─────────────────────┴──────┘  │
│                                   │
│  ...                              │
└───────────────────────────────────┘
```

Vote button states — see `03-components.md §17`. Moving a vote:
1. Previous tile: vote button eases outlined (250 ms, standard).
2. New tile: vote button eases to tonal; tally increments with number-roll
   animation.
3. Live region announces: "You voted for Pho Forever. 2 votes, leading by 3."

Vote clearing (L2-13 AC 3): tapping current vote again crossfades to
outlined and announces "Vote cleared."

### 3.1 Realtime indicators (L2-19)

- **Other member votes** — the tally number rolls without a full card
  re-layout.
- **Reconnecting** — compact banner slides down under app bar (see
  `12-errors-empty-states.md §5`).

---

## 4. Tie-breaker round (L2-14)

Triggered automatically when voting ends in a tie.

```
┌───────────────────────────────────┐
│  ←  Tie-breaker            ⋮      │
├───────────────────────────────────┤
│  [ Tie-breaker ]   closes in      │
│                     01 : 58       │
│  ▓▓░░░░░░░░░░░░░░░░░░░░   3 %     │
│                                   │
│  It's a tie! Vote again from the  │   body-large, centered, space-6
│  leaders below.                   │
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 🌮 Taco Town                │  │   only tied entries are shown
│  │ 5 votes                     │  │
│  │ ██████████████              │  │
│  │                     ┌──────┐│  │
│  │                     │ Vote ││  │
│  └─────────────────────┴──────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 🍜 Pho Forever              │  │
│  │ 5 votes                     │  │
│  │ ██████████████              │  │
│  │                     ┌──────┐│  │
│  │                     │ Vote ││  │
│  └─────────────────────┴──────┘  │
└───────────────────────────────────┘
```

If the tie-breaker also ends tied (L2-14 AC 3):

```
 ┌────────────────────────────────────────┐
 │  🎲  Winner chosen at random           │
 │  The tie-breaker ended tied, so we     │
 │  picked a winner for you.              │
 └────────────────────────────────────────┘
```
(Shown as a banner above the winner reveal.)

---

## 5. Winner reveal (L2-15)

Full-viewport on xs/sm; `mat-dialog` 640 × 520 px on md+. Appears within 2 s
of state transition to `Decided` (L2-15 AC 1).

Frame 0 → 1: scrim fade, card pop-in from 0.94 → 1 scale, 500 ms
(`motion-long-2`, `motion-ease-emphasized`). Confetti `tertiary` particles
burst from top-center, 1.2 s, reduced-motion suppresses.

```
┌───────────────────────────────────────────────┐
│                                               │
│                                               │
│                   🏆                           │   icon-hero, tertiary
│                                               │
│              Winner chosen!                   │   title-small · tertiary
│                                               │
│                                               │
│              Taco Town                        │   display-medium (xs) / large (md+)
│                                               │   display family
│                                               │
│           ★ 4.6 · Mexican                     │   title-medium
│           123 Main St                         │   body-medium
│                                               │
│                                               │
│    5 votes, decided in 23 minutes             │   body-small (muted)
│                                               │
│    ┌─────────────────────────────────────┐    │
│    │          Get directions             │    │   filled primary
│    └─────────────────────────────────────┘    │
│    ┌─────────────────────────────────────┐    │
│    │          Open website               │    │   tonal
│    └─────────────────────────────────────┘    │
│                                               │
│              Leave a review                   │   text button
│                                               │
└───────────────────────────────────────────────┘
 tertiary-container gradient background on the hero (angled 180°, subtle)
```

Live regions:

- `role="alert" aria-live="assertive"` announces:
  *"Winner: Taco Town, Mexican, 5 votes. Directions and website available."*

Dismiss: tap outside (xs/sm → navigates back to dashboard; md+ closes
dialog). Reveal can be reopened from the session's timeline.

---

## 6. Cancelled state (L2-08 AC 3)

```
┌───────────────────────────────────┐
│  ←  Today's lunch                 │
├───────────────────────────────────┤
│  [ Cancelled ]                    │   outline chip
│                                   │
│  This lunch was cancelled by      │   body-large
│  Priya at 12:14 PM.               │
│                                   │
│  Read-only view below.            │   body-small (muted)
│                                   │
│  ┌─────────────────────────────┐  │
│  │ Suggestions (read-only)     │  │   same list but with no vote
│  │ ...                         │  │   buttons, suggest disabled
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

---

## 7. Comments / thread (L2-16)

On mobile, each suggestion's comments are reached by tapping the `💬` row,
which opens a bottom-sheet thread. On md+ they appear in the right column.

```
Bottom sheet (xs)

┌───────────────────────────────────┐
│           ─                       │   drag handle
│  Comments on Taco Town (2)        │   title-medium, close ✕ trailing
├───────────────────────────────────┤
│                                   │
│  👤 Priya · 2m                    │
│  I love their horchata. Second    │
│  vote!                            │
│                      ✎ edited     │
│                                   │
│  👤 Jordan · 1m                   │
│  Cash only fyi.                   │
│                                   │
│  ( scroll to top of newest )      │
├───────────────────────────────────┤
│  👤  Add a comment…           ➤   │   sticky composer, safe-area-aware
│                                   │   expands to 3 lines on focus
└───────────────────────────────────┘
```

Composer rules (L2-16 AC 1):

- 1–500 chars. Counter appears at 400 chars. Send disabled outside [1, 500].
- Submit sends optimistically; failure rolls back with an error snackbar and
  restores draft.

Own-comment affordance (L2-16 AC 2 / AC 3):

```
  ┌─────────────────────────┐
  │  Edit                   │   enabled < 5 min after posting
  │  Delete          (red)  │
  └─────────────────────────┘
```

Deleted comments render as:

```
  [ Comment deleted ]                 body-medium, italic, outline bg pill
```

Edit UI: inline textarea swap, "Save" / "Cancel" buttons; after save, the
comment gets an `(edited)` affordance in its byline.

---

## 8. Presence (L2-20)

```
 👤 👤 👤 +4 online
```

Tap opens a bottom sheet listing online members:

```
┌───────────────────────────────────┐
│  Online now · 7                   │
├───────────────────────────────────┤
│  👤 Priya Patel     ● online      │
│  👤 Jordan Lee      ● online      │
│  👤 Sam Kim         ● online      │
│  👤 Alex Wong       ● online      │
│  …                                │
│  Away                             │
│  👤 Dana Park       · 2m ago      │
└───────────────────────────────────┘
```

Implementation: presence dot = 10 px, `--qq-color-online-dot` + 2 px
`surface` ring, overlays avatar bottom-right.

---

## 9. Responsive — desktop/tablet session view

```
┌──────────────────────────────────────────────────────────────────────────┐
│  QuorumQ · Team Tacos                                  🔔  ⚙  👤          │
├────┬─────────────────────────────────────────────────────────────────────┤
│ 🏠 │  [ Voting ] closes in 12:34   ████████████░░░░░░░   65 %            │
│ 🍽●│  👤 👤 👤 +4 online                                                  │
│ 🕓 ├──────────────────────────────┬─────────────────────────────────────┤
│ 👥 │  Suggestions (4)             │  Taco Town                           │
│ ⚙  │                              │  Mexican · 123 Main                  │
│    │  ● Taco Town         5 votes │                                      │
│    │  ○ Pho Forever       2 votes │  ┌───────────────────────────────┐  │
│    │  ○ Green Bowl        1 vote  │  │ [ Vote ]                      │  │
│    │  ○ Curry House       0 votes │  └───────────────────────────────┘  │
│    │                              │                                      │
│    │                              │  Comments (2)                        │
│    │                              │  👤 Priya: I love their horchata.   │
│    │                              │  👤 Jordan: Cash only fyi.          │
│    │                              │                                      │
│    │                              │  ┌───────────────────────────────┐  │
│    │                              │  │ Add a comment…            ➤   │  │
│    │                              │  └───────────────────────────────┘  │
└────┴──────────────────────────────┴──────────────────────────────────────┘
```

The left panel is the selectable suggestion list; the right panel shows
detail + comments. Keyboard: ↑/↓ moves selection, Enter opens detail, V casts
vote.

---

## 10. Angular Material components used

- `mat-toolbar`, `mat-sidenav-container`, `mat-list`, `mat-nav-list`
- `mat-card`, `mat-progress-bar`, `mat-chip`, `mat-chip-set`
- `mat-form-field` / `matInput` / `matAutocomplete`
- `mat-button` (all variants), `mat-icon-button`, `mat-fab`
- `mat-bottom-sheet` (mobile thread, suggest, start-lunch)
- `mat-dialog` (desktop winner reveal, cancel confirmation)
- `mat-snack-bar` (duplicate warning, "Winner chosen at random")
- `mat-menu` (overflow actions)
