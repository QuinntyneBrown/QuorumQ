# QuorumQ Design System

This folder contains the visual and interaction design for QuorumQ — the
mobile-first lunch-voting app described in [`../specs/l1.md`](../specs/l1.md)
and [`../specs/l2.md`](../specs/l2.md).

The design system is built on **Angular Material** (Material Design 3 /
MDC-based components). Every screen is composed from Angular Material
primitives, themed with Material 3 tokens. No additional UI framework is
introduced (per L2-46 and L2-47).

## How to read these documents

All mockups are rendered as annotated ASCII wireframes plus explicit token
references. This keeps the design source-controlled, diff-able, and
unambiguous for the developer implementing it in Angular Material. Each screen
lists:

1. Purpose and traced L2 requirement(s)
2. Mobile wireframe (375 px default)
3. Tablet / desktop adaptation (where it changes)
4. The Angular Material components used
5. Tokens consumed (color role, type scale, spacing, elevation)
6. Interaction notes (states, motion, a11y)

## Folder map

| File | Contents |
|------|----------|
| [`01-design-tokens.md`](01-design-tokens.md) | Color, typography, spacing, radius, elevation, motion, z-index, breakpoint tokens |
| [`02-theming.md`](02-theming.md) | Material 3 palette, light & dark themes, Angular Material `$theme` config |
| [`03-components.md`](03-components.md) | Every Material component, every variant, every state, with spacing |
| [`04-layout-navigation.md`](04-layout-navigation.md) | App shell, bottom nav, top app bar, responsive grid, safe areas |
| [`05-screens-auth.md`](05-screens-auth.md) | Landing, sign in, sign up, verify email, forgot password, rate-limited |
| [`06-screens-team.md`](06-screens-team.md) | Team dashboard, team switcher, create team, invite, accept invite, empty state |
| [`07-screens-session.md`](07-screens-session.md) | Active session, suggest, vote, tie-breaker, winner reveal, cancelled |
| [`08-screens-restaurant.md`](08-screens-restaurant.md) | Restaurant profile, leave review, review list, empty state |
| [`09-screens-history.md`](09-screens-history.md) | History list, past session detail, export CSV |
| [`10-screens-settings.md`](10-screens-settings.md) | Account, theme, notifications, delete account, about |
| [`11-dialogs.md`](11-dialogs.md) | Every dialog (confirm, destructive, form, info) |
| [`12-errors-empty-states.md`](12-errors-empty-states.md) | Inline validation, 403/404/500, offline, reconnecting, empty lists |
| [`13-notifications.md`](13-notifications.md) | Snackbars, toasts, live-region announcements |
| [`14-motion.md`](14-motion.md) | Easing, durations, choreographies, reduced-motion |
| [`15-accessibility.md`](15-accessibility.md) | Focus, ARIA, contrast, target sizes, live regions |
| [`16-icons-imagery.md`](16-icons-imagery.md) | Icon set, avatars, illustrations, empty-state art |

## Foundational principles

1. **Mobile-first, thumb-reachable.** Primary actions sit in the bottom third
   of the viewport at ≤ 640 px (L2-21).
2. **One source of truth: tokens.** Never hard-code colors, sizes, or
   durations in components; always reference the token names in
   [`01-design-tokens.md`](01-design-tokens.md) (L2-24).
3. **Material 3 throughout.** Color roles (`primary`, `on-primary`,
   `surface-container`, …) come from Material 3; typography from the M3 type
   scale (L2-46).
4. **WCAG 2.1 AA.** Text contrast ≥ 4.5:1, touch targets ≥ 44 × 44 CSS px,
   visible focus ring on every interactive element (L2-27, L2-23).
5. **Motion with purpose, never mandatory.** Every non-essential animation is
   suppressed under `prefers-reduced-motion: reduce` (L2-25).
6. **Radical simplicity.** No ad-hoc components. If Angular Material provides
   it, use it. If not, compose it from Material primitives (L2-47).

## Breakpoints

| Name     | Min width | Layout                  |
|----------|-----------|-------------------------|
| `xs`     | 0         | Single column, bottom nav, FAB |
| `sm`     | 600 px    | Single column, wider gutters |
| `md`     | 905 px    | Two-column (list + detail), rail nav |
| `lg`     | 1240 px   | Three-region (rail + list + detail) |
| `xl`     | 1440 px   | Same as `lg`, larger max-width 1440 |

Aligned to the Angular CDK `BreakpointObserver` defaults and to Material 3's
window-size classes.

## Palette summary (full spec in `02-theming.md`)

- **Primary** — Warm tomato red `#E04F3C` (evokes food, energy, urgency of a
  ticking vote clock)
- **Secondary** — Herb green `#4C8B6B`
- **Tertiary** — Amber `#F2B134` (used for the winner reveal)
- **Error** — `#B3261E` (M3 default error)
- **Neutral** — Warm greys

These map to Material 3 color roles and are applied through Angular Material
theming. Dark theme uses the dark tonal palette at the same roles.

## Traceability

Every design decision is traced to the L2 requirement it serves. See the
"Traces to" tag on each screen. The reverse index:

| L2 ID | Design file |
|-------|-------------|
| L2-01 Create Team | [06-screens-team.md](06-screens-team.md) |
| L2-02 Invite | [06-screens-team.md](06-screens-team.md), [11-dialogs.md](11-dialogs.md) |
| L2-03 Join Multiple Teams | [04-layout-navigation.md](04-layout-navigation.md), [06-screens-team.md](06-screens-team.md) |
| L2-04 Sign Up | [05-screens-auth.md](05-screens-auth.md) |
| L2-05 Sign In / Out | [05-screens-auth.md](05-screens-auth.md), [04-layout-navigation.md](04-layout-navigation.md) |
| L2-06 Session Persistence | [05-screens-auth.md](05-screens-auth.md) |
| L2-07 Start Session | [07-screens-session.md](07-screens-session.md) |
| L2-08 Session States | [07-screens-session.md](07-screens-session.md) |
| L2-09 Active Session Surface | [06-screens-team.md](06-screens-team.md) |
| L2-10 Suggest | [07-screens-session.md](07-screens-session.md) |
| L2-11 Reuse Past Restaurants | [07-screens-session.md](07-screens-session.md) |
| L2-12 Withdraw | [07-screens-session.md](07-screens-session.md) |
| L2-13 Cast Vote | [07-screens-session.md](07-screens-session.md) |
| L2-14 Tie Breaker | [07-screens-session.md](07-screens-session.md) |
| L2-15 Winner Reveal | [07-screens-session.md](07-screens-session.md), [14-motion.md](14-motion.md) |
| L2-16 Comment | [07-screens-session.md](07-screens-session.md) |
| L2-17 Review | [08-screens-restaurant.md](08-screens-restaurant.md) |
| L2-18 Restaurant Profile | [08-screens-restaurant.md](08-screens-restaurant.md) |
| L2-19 Real-time Updates | [12-errors-empty-states.md](12-errors-empty-states.md), [13-notifications.md](13-notifications.md) |
| L2-20 Presence | [07-screens-session.md](07-screens-session.md) |
| L2-21 Mobile Layout | [04-layout-navigation.md](04-layout-navigation.md) |
| L2-22 Tablet/Desktop | [04-layout-navigation.md](04-layout-navigation.md) |
| L2-23 Touch/Pointer Parity | [15-accessibility.md](15-accessibility.md), [03-components.md](03-components.md) |
| L2-24 Design System | entire folder |
| L2-25 Motion & Delight | [14-motion.md](14-motion.md) |
| L2-26 Dark & Light | [02-theming.md](02-theming.md), [10-screens-settings.md](10-screens-settings.md) |
| L2-27 WCAG AA | [15-accessibility.md](15-accessibility.md) |
| L2-28 Screen Reader | [13-notifications.md](13-notifications.md), [15-accessibility.md](15-accessibility.md) |
| L2-37 History | [09-screens-history.md](09-screens-history.md) |
| L2-38 Export History | [09-screens-history.md](09-screens-history.md) |
| L2-39 In-app Notifications | [13-notifications.md](13-notifications.md) |
| L2-40 Notification Preferences | [10-screens-settings.md](10-screens-settings.md) |
| L2-43 Account Deletion | [10-screens-settings.md](10-screens-settings.md), [11-dialogs.md](11-dialogs.md) |
| L2-46 Angular Material | [03-components.md](03-components.md) |
