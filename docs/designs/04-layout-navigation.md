# 04 · Layout & Navigation

**Traces to:** L2-03, L2-21, L2-22, L2-23, L2-27

QuorumQ uses a single responsive **App Shell** with three nav modes:

| Breakpoint | Nav mode       | Shell components                  |
|------------|----------------|-----------------------------------|
| `xs`, `sm` | Bottom nav     | Top app bar (small) + bottom nav + FAB |
| `md`       | Nav rail       | Top app bar + rail                |
| `lg`, `xl` | Nav rail + drawer | Top app bar + rail + optional content drawer |

Transitions between modes are determined solely by viewport width — no user
setting — so a tablet rotating to landscape switches seamlessly.

---

## 1. Mobile (375 × 812) — default `xs`

```
┌───────────────────────────────────┐   safe-area-inset-top
│  status bar                       │
├───────────────────────────────────┤
│ ☰  QuorumQ · Team Tacos   🔔  👤 │   top app bar (56 px)
├───────────────────────────────────┤
│                                   │
│                                   │
│           (page content)          │
│                                   │
│                                   │
│         ·  ·  ·  ·  ·  ·          │   scroll region
│                                   │
│                                   │
│                                   │   FAB at bottom-right
│                              ┌──┐ │   16 px from edge,
│                              │+ │ │   72 px above bottom nav
│                              └──┘ │
│                                   │
├───────────────────────────────────┤
│  🏠    🍽    🕓    👥             │   bottom nav (80 + safe-area)
│  Home  Lunch  Hist  Team          │
└───────────────────────────────────┘   safe-area-inset-bottom
```

Spec:

- **Top app bar**: height 56 (xs) / 64 (sm+). Scroll-shrinks to 48 px on xs
  when content scrolled > 8 px, with `elev-2`.
- **Bottom nav**: 4 destinations, labeled always. Icon 24 px, label 12 px
  (label-small). Active destination: primary icon fill + primary label +
  secondary-container "pill" behind icon (28 × 40 px). Haptic-like ripple on
  tap.
- **FAB**: bottom-right, 16 px gutters. Disappears (scale 0, 200 ms) when the
  active destination has no primary action (e.g. Settings).
- **Back gesture**: the leading icon is `menu` on root screens and `arrow_back`
  on deeper screens; Android back button + browser back both work.

### 1.1 Safe areas

```
  ┌───────────────────────────────────┐
  │  env(safe-area-inset-top)         │
  │  ┌─────────────────────────────┐  │
  │  │ top app bar                 │  │
  │  └─────────────────────────────┘  │
  │  ┌─────────────────────────────┐  │
  │  │ content (scrolls)           │  │
  │  │                             │  │
  │  └─────────────────────────────┘  │
  │  ┌─────────────────────────────┐  │
  │  │ bottom nav                  │  │
  │  └─────────────────────────────┘  │
  │  env(safe-area-inset-bottom)      │
  └───────────────────────────────────┘
```

### 1.2 Thumb-reach heatmap (for L2-21)

```
      cold
   ┌───────────┐
   │           │    The top third of a 812 px screen is
   │           │    reached only with a full grip shift;
   │   warm    │    primary actions therefore live in the
   │           │    bottom third (FAB, primary-action sheet,
   │           │    bottom nav, sticky composer).
   │   hot     │
   │   hot     │
   └───────────┘
      bottom
```

---

## 2. Tablet (905 × 1280) — `md`

```
┌──────────────────────────────────────────────────────────────┐
│  QuorumQ · Team Tacos                       🔔  ⚙  👤        │
├────┬─────────────────────────────────────────────────────────┤
│ 🏠 │                                                         │
│    │                                                         │
│ 🍽 │        two-column page content                          │
│    │                                                         │
│ 🕓 │   ┌───────────────┐  ┌─────────────────────────────┐    │
│    │   │ suggestions   │  │ suggestion detail /         │    │
│ 👥 │   │ list          │  │ comments thread             │    │
│    │   │               │  │                             │    │
│    │   │               │  │                             │    │
│ ⚙  │   └───────────────┘  └─────────────────────────────┘    │
└────┴─────────────────────────────────────────────────────────┘
 72px rail
```

Grid: 12 columns, 24 px gutters. Column widths for the session screen:
suggestions list = 5 cols, detail/thread = 7 cols.

---

## 3. Desktop (1440 × 900) — `lg`

```
┌──────────────────────────────────────────────────────────────────────────┐
│  QuorumQ · Team Tacos                                  🔔  ⚙  👤          │
├────┬────────────────────────┬────────────────────────────────────────────┤
│ 🏠 │  sessions / lists       │  detail / thread / info                    │
│ 🍽 │                         │                                            │
│ 🕓 │                         │                                            │
│ 👥 │                         │                                            │
│ ⚙  │                         │                                            │
└────┴────────────────────────┴────────────────────────────────────────────┘
 72px            5 cols @ 24px gutter               7 cols @ 24px gutter
 rail            max-width 1240 px centered
```

Optional right drawer on `xl` for presence (L2-20) and session metadata.

---

## 4. Team switcher (L2-03)

A top-of-app trigger opens a full-height left drawer on mobile, a dropdown
menu on desktop.

### 4.1 Mobile drawer

```
┌───────────────────────────────────┐
│  ←  Your teams                    │   title-large
├───────────────────────────────────┤
│  ● Team Tacos         ✓           │   secondary-container bg
│    3 active sessions              │
├───────────────────────────────────┤
│  ● Engineering                    │
│    last lunch: 2 days ago         │
├───────────────────────────────────┤
│  ● Marketing                      │
├───────────────────────────────────┤
│                                   │
│  ┌────────────────────────────┐   │
│  │  + Create a team           │   │   tonal button
│  └────────────────────────────┘   │
│  ┌────────────────────────────┐   │
│  │  Enter invite code         │   │   outlined
│  └────────────────────────────┘   │
└───────────────────────────────────┘
```

### 4.2 Desktop menu

```
  QuorumQ · Team Tacos ▾
          └────────┬──────────────────┐
                   │  ● Team Tacos ✓   │
                   │  ○ Engineering    │
                   │  ○ Marketing      │
                   │  ─────────────    │
                   │  + Create team    │
                   │  ⎘ Enter invite   │
                   └───────────────────┘
```

---

## 5. Navigation destinations

Four primary destinations are persistent in the bottom nav / rail:

| Destination | Route                       | Empty behavior                      |
|-------------|-----------------------------|-------------------------------------|
| Home        | `/t/:teamId`                | Start-team or empty-state card      |
| Lunch       | `/t/:teamId/lunch`          | Start-lunch CTA when no active session |
| History     | `/t/:teamId/history`        | Encouraging empty illustration      |
| Team        | `/t/:teamId/members`        | Invite CTA                           |

Settings (`/settings`), account (`/me`), and restaurant profile
(`/t/:teamId/r/:id`) are secondary destinations reached via menu / tap; they
don't get a persistent nav slot.

---

## 6. Scroll & overflow rules

- The **page content** region is the only scroll container on mobile; the
  top app bar and bottom nav are fixed.
- On desktop, the page content is inside a `<main>` that scrolls within its
  grid cell; the rail and app bar stay fixed.
- Long lists use **virtual scrolling** (`@angular/cdk/scrolling`) when item
  count > 40 — this is a decision the design mandates because the session
  screen can grow to 100+ comments.

---

## 7. Page transitions

- Bottom-nav tab change: crossfade content 120 ms, no horizontal slide
  (matches Material 3 guidance).
- Push (drill down): slide-in from right 300 ms emphasized-decel on xs;
  crossfade 200 ms on md+.
- Pop: reverse.
- Respect `prefers-reduced-motion`: crossfade only at 100 ms.

---

## 8. Landmark regions (a11y)

Every layout has these semantic regions:

```
<header role="banner">         top app bar
<nav   role="navigation">      bottom nav / rail / drawer
<main  role="main">            page content (ID for skip link)
<aside role="complementary">   drawer content (when open)
<div   role="status" aria-live="polite">  reconnecting banner
<div   role="alert"  aria-live="assertive"> critical errors, winner announce
```

A **"Skip to content"** link is the first tab-stop on every page:

```
 [ Skip to content ]   anchored top-left when focused, filled button style
```
