# 03 · Component Library

**Traces to:** L2-23, L2-24, L2-27, L2-46, L2-47

Every interactive control in QuorumQ is an Angular Material component, or a
composition of Angular Material primitives. This document catalogs each
component in use, every variant and state, exact spacing, and the props a
template author should pass.

> Legend for wireframes
> `█` filled surface · `░` hover/focus tint · `▒` pressed tint
> `─│┌┐└┘` outlined edges · `▬` disabled · `★` focus ring (2 px outline offset 2 px)

---

## 1. Buttons

Angular Material: `MatButton` (variants: `matButton`, `matButton="filled"`,
`matButton="tonal"`, `matButton="outlined"`, `matButton="elevated"`, `matButton="text"`).

### 1.1 Filled button (primary action)

```
┌────────────────────────────┐    tokens
│        Start lunch         │    bg  : primary
└────────────────────────────┘    fg  : on-primary
                                  radius: radius-full (pill) on mobile
 height 40 px  ·  min-width 48 px ·  pad-x space-6 (24)
 label  label-large  ·  icon 18 px leading (space-2 gap)
```

States

```
resting    hover         focus         pressed       disabled
[ Start ]  [░Start ]     [★Start ]     [▒Start ]     [▬Start ]
           +8 % overlay  +12 % overlay +12 % overlay  on-prim @ 38 %
```

Loading (used on auth submit and vote):
```
[  ⟳  Start lunch ]    spinner 18 px, leading, replaces icon
```

When to use: the single most important action on a view (one per surface).

### 1.2 Tonal button (secondary primary)

```
┌────────────────────────────┐    bg : secondary-container
│        Suggest again       │    fg : on-secondary-container
└────────────────────────────┘
```
Used for: "Reuse past restaurant", "Invite more members", "Copy link".

### 1.3 Outlined button

```
┌────────────────────────────┐    border: outline  (1 px)
│         Cancel             │    fg    : primary
└────────────────────────────┘    bg    : transparent
```
Used for: secondary actions in dialogs, "Back to dashboard".

### 1.4 Text button

```
        Forgot password?          fg : primary
        └─ label-large ─┘         pad-x space-3
```
Used for: inline actions ("Sign in", "Resend email"), menu close actions.

### 1.5 Elevated button

Rare; used only where a filled button would be lost on a busy photo/hero
(e.g. atop a winner-reveal illustration). `elev-1` background on `surface`.

### 1.6 Icon button (`mat-icon-button`)

```
 ⓘ       size  : 40 × 40 (touch target ≥ 44 via margin)
 ─       icon  : 24 px
         hover : primary @ 8 % circular overlay
         focus : 2 px primary outline on surface
```

### 1.7 FAB & Extended FAB (`mat-fab`, `mat-fab-extended`)

```
mobile   ┌───────────────┐     desktop extended ┌────────────────────┐
         │     ┌───┐     │                      │   +  Start lunch   │
         │     │ + │     │                      └────────────────────┘
         │     └───┘     │
         └───────────────┘
 56 × 56 px, elev-3      40 height, pad-x space-5
 pill radius, primary    shows label on md+
```

Placement:
- `xs`: bottom-right, 16 px from edge, 72 px above bottom nav, safe-area aware.
- `md`+: inline in page header as extended FAB.

Hides on scroll-down, shows on scroll-up (`scroll-away` behavior, 200 ms).

### 1.8 Segmented button (`mat-button-toggle-group`)

```
┌──────────┬──────────┬──────────┐
│  System  │   Light  │   Dark   │     tokens
└──────────┴──────────┴──────────┘     selected : secondary-container
                                        unselected: transparent, outline
```
Used for: theme picker, session state filter in history, vote-sort.

---

## 2. Text fields (`mat-form-field`)

Appearance: **outlined** (Material 3 style) globally.

### 2.1 Anatomy
```
  Label (floating)
 ┌───────────────────────────────────┐
 │  ⓘ   Value or placeholder     ✕  │   48 px height
 └───────────────────────────────────┘
  Helper text · 0 / 50                 label-medium
```
Tokens: border `outline` → `primary` on focus (2 px), label `on-surface-variant`
→ `primary` when focused, fill `transparent`.

### 2.2 States

```
resting                                   focus
┌───────────────────────────────────┐    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
│  Email                            │    ┃ Email                             ┃
└───────────────────────────────────┘    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 Helper text                              Helper text   (primary 1 px → 2 px)

error                                     disabled
┌───────────────────────────────────┐    ┌───────────────────────────────────┐
│  Email                         !  │    │  Email                            │
└───────────────────────────────────┘    └───────────────────────────────────┘
 Enter a valid email address.             (all content @ 38 %)
 (border + label + helper = error)
```

### 2.3 Variants

- **Password** — trailing `visibility` icon button (toggle); caps-lock warning
  inline helper.
- **Email** — `type=email`, `autocomplete=email`, `inputmode=email`.
- **Search** — leading `search` icon, trailing `clear` icon, returns on
  submit; used in restaurant autocomplete (L2-11).
- **Numeric countdown** — spinner stepper for voting-deadline minutes
  (`type=number`, min 5, max 180).
- **Textarea** — comment and review composer; auto-grow 3 → 8 lines; character
  counter `body / 500`.

### 2.4 Autocomplete (`mat-autocomplete`)

```
┌───────────────────────────────────┐
│  🔍  Taco                         │
└───────────────────────────────────┘
┌───────────────────────────────────┐     elev-2, radius-md
│  🍽  Taco Town      · Mexican     │     item height 56 px
│  🍽  Taco Tuesday   · Mexican     │     leading icon + title + caption
│  🍽  El Tacorrico   · Mexican     │
└───────────────────────────────────┘
```
Debounced at 150 ms, responds within 300 ms (L2-11 AC 1).

### 2.5 Password strength (inline, L2-04 AC 3)

```
 Password   ●●●●●●● 👁
 ┌───────────────────────────────────┐
 │  ············                     │
 └───────────────────────────────────┘
 ▰▰▰▰▱▱▱  Good
 · 8+ characters  ✓
 · one number     ✓
 · one symbol     ✗
```
Strength bar uses `primary` for Good/Strong, `error` for Weak. Rules read by
screen readers as a `<ul>` with aria-live="polite".

---

## 3. Selection controls

### 3.1 Checkbox (`mat-checkbox`)
```
 ☐  Remember me                     ☑  Remember me        (checked: primary)
 20 × 20 hit, 40 × 40 target                              outline 2 px → fill
```

### 3.2 Radio (`mat-radio-group`)
```
 ○ System  ● Light  ○ Dark
```

### 3.3 Toggle switch (`mat-slide-toggle`)
```
 Notifications  ○───   (off: outline thumb, surface-container-highest track)
 Notifications   ──●   (on : primary thumb, primary-container track)
 Thumb 20 px, track 52 × 32 px, pill radius
```
Used for notification preferences (L2-40), theme override, presence.

### 3.4 Slider (`mat-slider`)
```
 Voting window
 5 min ●──────────────────── 180 min
                   ▲ 30 min
 Value shown in a value indicator above the thumb on drag.
```

---

## 4. Cards (`mat-card`)

### 4.1 Session card (used on dashboard — L2-09)
```
┌───────────────────────────────────────────────┐  radius-md, elev-1,
│  🍽  Lunch · Today                            │  bg surface-container-low
│  [Voting · 12 : 34]                           │  pad space-4
│                                               │
│  ████████████████░░░░░░░░░   65 %             │  progress bar = time left
│                                               │
│  8 members voted · 3 remaining                │  body-medium · on-surface-variant
│                                               │
│  ┌───────────┐  ┌───────────┐                 │
│  │  Open     │  │  Invite   │                 │  filled + tonal
│  └───────────┘  └───────────┘                 │
└───────────────────────────────────────────────┘
```

### 4.2 Suggestion card (horizontal)
```
┌──────────────────────────────────────────────────────┐  radius-md
│  ┌────┐  Taco Town · Mexican          ♥ 4   💬 2     │  title-medium
│  │img │  123 Main St                                  │  body-small
│  └────┘  Suggested by Priya · 2m ago                  │  body-small (muted)
│          ┌────────┐                                   │
│          │  Vote  │                                   │  filled button
│          └────────┘                                   │
└──────────────────────────────────────────────────────┘
 pad space-4, gap space-3, image 72×72 radius-sm
```

### 4.3 Empty-state card
```
┌───────────────────────────────────────────────┐
│                                               │
│              🍽   (icon-hero)                 │
│                                               │
│         No lunches yet today                  │  headline-small
│         Get the team eating together          │  body-medium (muted)
│                                               │
│         ┌─────────────────────┐               │
│         │    Start lunch      │               │
│         └─────────────────────┘               │
└───────────────────────────────────────────────┘
 pad space-10 vertical, space-6 horizontal
```

---

## 5. Chips (`mat-chip-set`)

### 5.1 Assist chip — quick actions
`[🚗 Directions]  [🌐 Website]  [⭐ Review]`  · height 32, radius-full

### 5.2 Filter chip — history filter
`[ All ]  [ Decided ]  [ Cancelled ]`  · selected: `secondary-container` bg

### 5.3 Input chip — cuisine tags in suggest form
`[ Mexican ✕ ] [ Vegetarian ✕ ] + Add`

### 5.4 Suggestion chip — session-state badge
```
Suggesting    → bg state-suggesting/container, text on-secondary-container, icon ✎
Voting        → bg state-voting/container,     text on-primary-container,   icon 🗳
Decided       → bg state-decided/container,    text on-tertiary-container,  icon 🏆
Cancelled     → bg surface-container-highest,  text on-surface-variant,     icon ✕
```
Height 24, radius-full, label-small, 4 px gap between icon and label.

---

## 6. Lists (`mat-list`, `mat-nav-list`)

### 6.1 Single-line
```
 ▸  Taco Town               →
     ─────────── divider ──────────
 ▸  Pho Forever             →
```
Height 56 px, leading icon 24 px at space-4, trailing chevron.

### 6.2 Two-line
```
 👤  Priya Patel
     Suggested 4 places
 ─────────────────────────────────
 👤  Jordan Lee
     Suggested 2 places
```
Height 72 px, avatar 40 px.

### 6.3 Three-line (comments)
```
 👤  Jordan Lee        · 3m · edited
     I love their horchata.
     Second vote!
```
Height flexes to content; min 88 px.

---

## 7. Navigation

### 7.1 Top app bar (`mat-toolbar`)
```
 ┌──────────────────────────────────────────────────┐
 │  ☰   QuorumQ · Team Tacos          🔔  ⚙  👤    │    height 64 (xs 56)
 └──────────────────────────────────────────────────┘
 elev-0 at rest, elev-2 when content scrolled underneath
 color: surface, on-surface for text
```
Title = "QuorumQ" on landing; "· Team Name" when inside a team.

### 7.2 Bottom navigation (xs/sm only — L2-21)
```
 ┌──────────────────────────────────────────────────┐
 │   🏠      🍽      🕓      👥                     │
 │  Home   Lunch   History  Team                    │  80 px height + safe area
 └──────────────────────────────────────────────────┘
 active: primary icon + label; inactive: on-surface-variant
 ripple circular around icon; ink line under label
```

### 7.3 Navigation rail (md+)
```
 ┌────┐┌──────────────────────────────────────┐
 │ 🏠 ││                                      │
 │ 🍽 ││          page content                │
 │ 🕓 ││                                      │
 │ 👥 ││                                      │
 │    ││                                      │
 │ ⚙  ││                                      │
 └────┘└──────────────────────────────────────┘
 72 px wide, icons centered, label under icon (label-small)
```

### 7.4 Side drawer (`mat-sidenav`) — team switcher
See `04-layout-navigation.md`.

### 7.5 Tabs (`mat-tab-group`)
```
 ┌─────────────┬─────────────┬─────────────┐
 │   Active    │   History   │   Members   │
 └─────────────┴─────────────┴─────────────┘   ink bar: primary, 3 px
 height 48, label-large, ripple under label
```

---

## 8. Dialog (`mat-dialog`)

```
 scrim (#000 @ 32 %)
 ┌────────────────────────────────────────┐   elev-3, radius-lg
 │  Title                                 │   title-large, space-6 around
 │  ──────────────────────────            │
 │                                        │   body-large
 │  Supporting text or content.           │
 │                                        │
 │                       Cancel   Confirm │   text / filled buttons
 └────────────────────────────────────────┘   gap space-2 between actions
  width: min(560, 100vw - 32); max-height 90vh
  mobile: bottom-sheet variant (see 11-dialogs.md)
```

---

## 9. Menus (`mat-menu`)

```
 ┌──────────────────────┐   elev-2, radius-sm, min-width 112
 │  Edit                │   height 48, leading icon optional
 │  Duplicate           │
 │  ──────────────────  │   divider
 │  Delete        (red) │   error role color
 └──────────────────────┘
```
Opens under trigger with 8 px gap, flips above if low space.

---

## 10. Snackbar (`mat-snack-bar`)

```
 ┌──────────────────────────────────────────────┐
 │  Invite link copied                   UNDO   │   radius-sm, elev-2
 └──────────────────────────────────────────────┘   bg inverse-surface
 duration 4 s (6 s with action); aria-live polite
```

---

## 11. Progress indicators

- `mat-progress-bar` linear: used for session-timer (determinate 0 → 100)
  and page loading (indeterminate).
- `mat-progress-spinner`: used on full-screen auth check (48 px) and inline
  in buttons (18 px).

Colors: `primary` by default; `tertiary` on winner-reveal confetti loader.

---

## 12. Tooltip (`matTooltip`)

- Shows after 500 ms hover / 100 ms focus.
- Max width 248; body-small; bg `inverse-surface`, text `inverse-on-surface`.
- Suppressed on touch (use helper text inline instead).

---

## 13. Badge (`matBadge`)

```
 🔔        primary dot, 8 px, top-right of icon button (unread count only)
 🔔 12     oval 16 px, label-small, primary bg, on-primary text
```

---

## 14. Avatar

- Sizes: `24` (inline), `32` (list), `40` (list leading), `56` (profile),
  `96` (account).
- Shape: `radius-full`.
- Colors: derived from user initials hash → one of primary, secondary,
  tertiary tones at container/on-container pair.
- Presence dot (L2-20): 10 px circle, 2 px `surface` ring, overlays
  bottom-right.

---

## 15. Stars / rating (`mat-button`-based composition — L2-17)

```
 ☆ ☆ ☆ ☆ ☆           empty
 ★ ★ ★ ★ ☆           interactive on hover fills
 star size icon-md, gap space-1; keyboard arrows to move, Enter to set
```

---

## 16. Countdown timer (custom, composed)

Composed from `mat-progress-bar` (time remaining) + label:
```
  Voting ends in   12 : 34
 ████████████████████░░░░░░░░
```
Live-region update every 60 s (polite), every 10 s under 1 minute, every 1 s
under 10 s (assertive). Turns `tertiary` in last 60 s, `error` in last 10 s
(and adds a pulse — suppressed under reduced-motion).

---

## 17. Vote button (compound — L2-13)

```
 default (not voted)              voted by me (toggled)
 ┌─────────────────────┐          ┌─────────────────────┐
 │   Vote       ▲ 3    │          │ ✓ Voted      ▲ 4    │
 └─────────────────────┘          └─────────────────────┘
 outlined, label-large            tonal, primary content
 tally right-aligned              tally animates ±1 (see 14-motion)
```
Tapping a different suggestion moves the vote: the previous button crossfades
back to default while the new one becomes "Voted". Single motion, 250 ms.

---

## 18. Comment composer (compound — L2-16)

```
 ┌───────────────────────────────────┐
 │ 👤  Add a comment…                │    textarea + send icon button
 │                                  ➤│
 └───────────────────────────────────┘    counter only when > 400 chars
                                          submit enabled 1–500 chars
```

---

## 19. Presence stack (compound — L2-20)

```
 👤 👤 👤 +4           avatars 24 px, overlap -8 px
 Online now
```
Tap opens a bottom-sheet listing online members.

---

## 20. Winner reveal hero (compound — L2-15)

```
 ┌───────────────────────────────────────────────┐
 │                  🏆                            │  icon-hero, tertiary
 │           Winner chosen!                      │  title-small, tertiary
 │                                               │
 │          Taco Town                            │  display-large, display family
 │          ★ 4.6 · Mexican                      │  title-medium
 │                                               │
 │  ┌───────────────┐ ┌────────────────┐         │
 │  │ Get directions│ │ Open website   │         │  filled + tonal
 │  └───────────────┘ └────────────────┘         │
 └───────────────────────────────────────────────┘
  full-viewport on xs/sm; modal dialog 640 wide on md+
```
Motion choreography in `14-motion.md §5`.

---

## 21. States matrix (all interactive components)

| State      | Visual token                                | A11y                             |
|------------|---------------------------------------------|----------------------------------|
| Resting    | default bg/fg                               | role, label                      |
| Hover      | +8 % on-color overlay                       | pointer cue only                 |
| Focus-visible | 2 px `primary` outline, offset 2 px     | `:focus-visible` only (not mouse) |
| Pressed    | +12 % on-color overlay + ripple             | active descendant if applicable  |
| Selected   | `secondary-container` tint + check icon     | `aria-pressed=true`              |
| Disabled   | container @ 12 %, content @ 38 %            | `aria-disabled=true`, no tabstop |
| Error      | `error` border / fg                         | `aria-invalid=true`, error describedby |
| Loading    | spinner replaces icon, label stays          | `aria-busy=true`                 |

---

## 22. Touch target rule

Every interactive element has a **minimum hit area of 44 × 44 CSS px**
(L2-23). Components smaller than 44 px (checkbox, radio, icon button at 40)
use invisible padding to expand the hit region — Angular Material enforces
this with its ripple container.
