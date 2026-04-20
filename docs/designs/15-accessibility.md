# 15 · Accessibility

**Traces to:** L2-10, L2-23, L2-27, L2-28

QuorumQ targets **WCAG 2.1 AA**, verified by axe automated scans and by
keyboard / screen-reader walk-throughs of every L2 acceptance criterion
(L2-27 AC 3).

---

## 1. Contrast (L2-27 AC 1)

Every text / background pair in the app references a role token from
`01-design-tokens.md`. Ratios audited:

| Use                           | Pair                                 | Ratio |
|-------------------------------|--------------------------------------|-------|
| Body text on surface          | `on-surface` / `surface`             | 14.9  |
| Secondary text on surface     | `on-surface-variant` / `surface`     | 7.9   |
| Button label on primary       | `on-primary` / `primary`             | 4.6   |
| Button label on secondary     | `on-secondary` / `secondary`         | 4.7   |
| Button label on error         | `on-error` / `error`                 | 6.3   |
| Outlined button text          | `primary` / `surface`                | 4.6   |
| Error helper text             | `error` / `surface`                  | 5.1   |
| Chip label on state-voting    | `on-primary-container` / `primary-container` | 13.7 |

Non-text (icons, outlines) must hit ≥ 3:1 against adjacent fill. The
`outline` token is tuned to 3.4 on surface for this reason.

No color is the **only** signal for state. Session states combine color
with an icon and a text label ("Voting"), votes combine bar length with a
number, and errors combine color with a warning icon and text.

---

## 2. Touch targets (L2-23 AC 2)

Every interactive element has a hit-area ≥ 44 × 44 CSS px. Where the visible
control is smaller, invisible padding (via the component's ripple container
or a `min-height` on the host) expands the hit area:

| Component       | Visual size | Hit area |
|-----------------|-------------|----------|
| Icon button     | 40 × 40     | 48 × 48  |
| Checkbox        | 20 × 20     | 44 × 44  |
| Radio           | 20 × 20     | 44 × 44  |
| Slide toggle    | 52 × 32     | 52 × 44  |
| Chip            | 32 tall     | 44 tall  |
| List item       | 56 min-h    | 56 min-h |
| Bottom-nav item | 64 × 64     | 64 × 80  |

---

## 3. Keyboard support (L2-23, L2-27 AC 2)

### 3.1 Global
- Tab / Shift+Tab traverses in reading order.
- `Esc` closes dialogs, bottom sheets, menus, and the team switcher.
- A **"Skip to content"** link is the first tab stop of every page; focus
  jumps into `<main>`.

### 3.2 Page-specific

| Screen / component          | Keys                                            |
|-----------------------------|-------------------------------------------------|
| Top app bar menus           | Enter/Space opens; ↓↑ moves; Enter selects; Esc closes |
| Bottom nav                  | ←/→ moves highlight without changing tab; Enter activates |
| Suggestion list (session)   | ↑/↓ moves selection; Enter opens detail; `V` casts vote; `C` focuses composer |
| Rating picker               | ←/→ changes value; Home/End jump to min/max; Enter commits |
| Star rating read-only       | Static, focusable group with composite aria-label |
| Team switcher drawer        | Tab enters; ↓↑ between teams; Enter switches   |
| History list                | ↑/↓ through sessions; Enter opens detail       |
| Dialogs                     | Focus trapped; Shift+Tab cycles within          |
| Autocomplete                | ↓ opens; ↓↑ moves; Enter selects; Esc closes; Backspace into empty field clears selection |

### 3.3 Focus visibility

Focus rings use `:focus-visible` only (no rings on mouse clicks). The ring
is a 2 px `primary` outline, 2 px offset from the control, with a 4 px
rounded contour. On dark theme it's `inverse-primary` for contrast.

```
  ┌─────────────────────┐
  │                     │   the ring is OUTSIDE the control's
  │   ┌──────────────┐  │   bounds, so it is never clipped by
  │   │   Vote       │  │   the control's radius
  │   └──────────────┘  │
  │                     │
  └─────────────────────┘
```

---

## 4. Semantic structure

### 4.1 Landmarks

Every page has:

- `<header role="banner">` — top app bar
- `<nav aria-label="Primary">` — bottom nav / rail
- `<main id="main" tabindex="-1">` — scrolled content
- `<aside>` — drawer or right panel, with contextual `aria-label`
- `<footer>` — app footer (desktop only; holds version, legal links)

### 4.2 Headings

Heading levels follow document order and never skip:

- `<h1>` — page title (may be visually hidden if the app bar already shows it)
- `<h2>` — section titles within the page
- `<h3>` — card titles, subsections
- `<h4>+` — not used by default

### 4.3 Forms

- Every `mat-form-field` has a visible `<mat-label>`. Placeholders never
  substitute for labels.
- Field groups use `<fieldset>` + `<legend>` (e.g. theme picker,
  notification event group).
- Error messages are associated via `aria-describedby`; the field itself
  sets `aria-invalid="true"`.
- Password strength rules are a `<ul aria-live="polite">` near the password
  field.

---

## 5. Screen reader behavior (L2-28)

### 5.1 Live regions

See `13-notifications.md §3` — two live regions (`polite`, `assertive`) are
always present in the shell.

### 5.2 Component ARIA

| Component               | Role / properties                                     |
|-------------------------|-------------------------------------------------------|
| Session-state chip      | `role="status"` · label: "Session state: Voting"       |
| Countdown timer         | `role="timer" aria-live="polite"` (assertive < 10 s)   |
| Vote button             | `aria-pressed` toggles; label: "Vote for Taco Town"; tally is separate element with `aria-label="5 votes"` |
| Presence stack          | `role="group" aria-label="Online members"`; each avatar `role="img" aria-label="Priya Patel, online"` |
| Reconnecting banner     | `role="status" aria-live="polite"`                     |
| Winner reveal           | `role="dialog" aria-modal="true" aria-labelledby`      |
| Snackbar                | `role="status"` (default) or `role="alert"` (error)    |
| FAB                     | `aria-label="Start lunch"` (visible-label "Start lunch" on extended) |
| Star rating             | `<fieldset role="radiogroup">` with 5 `role="radio"` children, each `aria-checked` |
| Vote progress bar       | `role="progressbar"` with `aria-valuenow/min/max`; `aria-label="Vote share for Taco Town"` |

### 5.3 Icon-only controls

Every `mat-icon-button` has an `aria-label`. No icon is left ambiguous.

---

## 6. Respect user preferences

- `prefers-color-scheme` decides the initial theme (L2-26).
- `prefers-reduced-motion` suppresses non-essential animations
  (`14-motion.md §10`).
- `prefers-reduced-transparency` (when supported) removes backdrop blur on
  elevated surfaces.
- `prefers-contrast: more` bumps borders and focus rings to
  `inverse-surface` contrast pairings.

---

## 7. Zoom and text resizing

- Layout remains usable at 200 % text zoom (Chrome default body up to 32 px).
- No content is clipped up to 400 % zoom on a 1280 × 1024 viewport
  (WCAG 1.4.10 Reflow).
- Touch targets and focus rings scale with text size when using browser
  zoom; layout uses `rem` for type-related spacing, `px` for icon sizes.

---

## 8. Language and direction

- `<html lang="en">` initially; the app is designed to accept LTR/RTL via
  `[dir]` without layout breaks. Bottom-nav order reverses in RTL.
- All strings come from a single i18n catalog (Angular's
  `@angular/localize`), so translators never edit markup.

---

## 9. Skip links and focus management on navigation

On every route change:

1. Scroll to top of `<main>` unless hash-linked.
2. Move focus to `<main id="main">` (not the heading, so screen readers
   announce the landmark).
3. After the first frame, announce the page title in the polite live region:
   "Team Tacos. Today's lunch. Voting."

---

## 10. Error prevention & recovery

- Destructive actions require confirmation (dialogs in `11-dialogs.md`).
- Destructive toasts offer UNDO for 8 s.
- Forms preserve draft input across navigation where it would be lost
  (composer drafts, suggestion drafts).
- A soft keyboard never overlaps the focused input (CDK `Overlay` positions
  bottom-sheets with `scrollStrategy: block` and the composer uses
  `cdk-virtual-keyboard-safe-area`).

---

## 11. Automated and manual QA (L2-27 AC 3)

- Every Playwright page-object exposes a `runAxe()` helper; CI fails on any
  critical or serious violation.
- Each L2 acceptance test runs the axe scan at the end of its happy path.
- Every release: a manual sweep with **NVDA + Firefox**, **VoiceOver +
  Safari iOS**, and **TalkBack + Chrome Android** on the core flows
  (sign in, suggest, vote, winner, review, history).
