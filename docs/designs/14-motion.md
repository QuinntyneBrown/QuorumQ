# 14 · Motion

**Traces to:** L2-15, L2-25, L2-30

Motion is purposeful. Each animation answers "what changed?" or "where did
that come from?" and never just decoration. All motion respects
`prefers-reduced-motion: reduce`.

Durations and easing come from `01-design-tokens.md §6`.

---

## 1. Choreography principles

1. **Meaningful** — every animation explains a state change or relationship.
2. **Short first** — aim for `motion-short-*` unless emphasis is required.
3. **Emphasized for hero moments** — winner reveal, destructive confirms,
   full-screen transitions.
4. **Compound motions** stage: *exit → enter*, never crossfade collision.
5. **Interruptible** — if a user interacts mid-animation, the animation
   snaps forward; nothing blocks input.

---

## 2. Component motions

| Component          | Change              | Duration           | Easing                     |
|--------------------|---------------------|--------------------|----------------------------|
| Button ripple      | press               | `short-1` (50)     | `linear`                   |
| Button press       | scale to 0.98       | `short-3` (150)    | `standard`                 |
| Icon toggle        | opacity/morph       | `short-3` (150)    | `standard`                 |
| Chip select        | bg fill             | `short-4` (200)    | `standard`                 |
| Menu open          | y-translate + fade  | `medium-2` (300)   | `emphasized-decel`         |
| Snackbar enter     | y-translate + fade  | `medium-2` (300)   | `emphasized-decel`         |
| Snackbar exit      | y-translate + fade  | `short-4` (200)    | `emphasized-accel`         |
| Dialog enter       | scale 0.94→1 + fade | `long-2` (500)     | `emphasized-decel`         |
| Dialog exit        | scale 1→0.96 + fade | `medium-2` (300)   | `emphasized-accel`         |
| Bottom sheet enter | slide-up            | `medium-3` (350)   | `emphasized-decel`         |
| Bottom sheet exit  | slide-down          | `medium-2` (300)   | `emphasized-accel`         |
| FAB show/hide      | scale + rotate 45°  | `medium-2` (300)   | `emphasized`               |
| Tab ink bar        | x-translate         | `medium-1` (250)   | `standard`                 |
| Progress indeterm. | 2 s cycle           | —                  | Material standard          |

---

## 3. Page transitions

### 3.1 Bottom nav tab change
- Outgoing content: opacity 1 → 0, 120 ms, `standard-accel`.
- Incoming content: opacity 0 → 1, 120 ms, `standard-decel`.
- No horizontal slide — Material 3 guidance for peer-level changes.

### 3.2 Push (drill down)
- Outgoing: translate-x 0 → -10 % + opacity 1 → 0, 200 ms.
- Incoming: translate-x 100 % → 0 + opacity 0 → 1, 300 ms,
  `emphasized-decel`.

### 3.3 Pop (back)
- Mirror of push, reversed.

### 3.4 Modal open/close
- Scrim fade 120 ms first; dialog follows with its own curve.

Reduced motion: all page transitions collapse to a 100 ms opacity crossfade;
no translations.

---

## 4. Vote tally choreography (L2-25 AC 1)

When a vote changes for another member, the affected suggestion card:

```
time 0         time 250ms        time 400ms
┌───────────┐  ┌───────────┐    ┌───────────┐
│ Votes 4   │  │ Votes 5   │    │ Votes 5   │
│ █████░░░  │  │ ██████░░  │    │ ██████░░  │
└───────────┘  └───────────┘    └───────────┘
  at rest      number rolls      bar eases
              4 → 5, 250 ms      4/total → 5/total
              standard-decel     long-1 (450), standard
```

For the voter's own vote (self-initiated), add a micro-pulse on the counter
("+1"): `scale 1 → 1.15 → 1`, 200 ms, `emphasized`.

---

## 5. Winner reveal choreography (L2-15 AC 1)

Duration budget: **≤ 2 s** from state transition to text visible (L2-15 AC 1).

```
 t = 0ms          Scrim fades in (0 → 0.32 opacity), 120 ms, linear
 t = 120ms        Reveal card enters: scale 0.88 → 1, opacity 0 → 1,
                  500 ms, emphasized-decel
 t = 200ms        🏆 icon staggers in: translate-y 16 → 0, opacity 0 → 1,
                  400 ms, emphasized-decel
 t = 350ms        "Winner chosen!" eyebrow staggers in, 300 ms
 t = 500ms        Restaurant name eases in: scale 0.96 → 1, 550 ms,
                  long-3, emphasized-decel
 t = 700ms        Rating + cuisine fade in, 300 ms
 t = 800ms        Action buttons slide up + fade, staggered 60 ms each,
                  200 ms per button, standard-decel
 t = 900ms        Confetti burst (tertiary particles), 1200 ms lifetime
                  — suppressed under reduced-motion
 t = 1200ms       Live-region announcement fires (assertive)
```

Frame-locked to ≥ 55 fps on a Moto G4 profile (L2-30).

Reduced motion variant:

```
 t = 0ms     Scrim fades in
 t = 120ms   Reveal card fades in (opacity only), 150 ms
 t = 200ms   Text is already visible; no stagger, no confetti
 t = 250ms   Announcement fires
```

---

## 6. Session-state transition

When the session moves `Suggesting → Voting` or `Voting → Decided`:

1. The state chip morphs: color token swaps (500 ms, `standard`),
   icon crossfades (150 ms).
2. Primary action region crossfades its contents: old primary fades 120 ms,
   new primary fades in 200 ms.
3. Countdown bar resets with a brief `scale-x 0 → 1` over 300 ms when a new
   deadline is set.

---

## 7. Countdown emphasis

Timer urgency tiers:

| Time left       | Visual                                       |
|-----------------|----------------------------------------------|
| > 1 min         | `primary` bar, number at rest                |
| ≤ 1 min         | Bar + text turn `tertiary`, number gains a subtle 1 s opacity pulse |
| ≤ 10 s          | Bar + text turn `error`; number scales 1 → 1.06 → 1 every 1 s |
| 0               | Freezes at 0 ; replaced by state-transition animation |

All pulses suppressed under reduced-motion (tier changes remain).

---

## 8. Presence & avatar motion

- Avatar entering presence stack: scale 0 → 1, 250 ms, `emphasized-decel`.
- Avatar leaving: scale 1 → 0, 150 ms, `emphasized-accel`.
- Online dot on first connection: ring-pulse 400 ms once
  (`@keyframes dot-pulse` 0 % opacity 0.8 → 100 % opacity 0).

---

## 9. Real-time "live" glow

New item (new comment, new suggestion) receives a **one-shot** surface tint
that fades out over 800 ms:

```
 on arrival: bg = surface-container-highest
 at 800 ms : bg = surface-container-low (default)
 easing    : standard
```

No chrome flash, no motion beyond color — reads as "new".

---

## 10. Reduced-motion policy (`prefers-reduced-motion: reduce`)

- All non-essential animations collapse to instantaneous or ≤ 100 ms fades.
- Confetti, parallax, and reveal-stagger are fully removed.
- Page transitions become 100 ms opacity crossfades.
- Component ripples remain (at default duration) — they are a feedback
  primitive, not an animation in the decorative sense.
- Live region announcements are **never** affected — they are always fired.

Implementation: root-level CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  .qq-reveal-confetti { display: none; }
}
```

Angular Material automatically honors `prefers-reduced-motion` for built-in
animations; the above rules catch QuorumQ's compound animations.

---

## 11. Performance budget (L2-30)

- Interaction-to-next-paint target: < 50 ms for all primary actions.
- No animation drops below 55 fps on mid-tier device (Moto G4 emulation).
- Avoid animating layout-impacting properties (`top`, `height`). Prefer
  `transform` + `opacity`. Exception: `mat-progress-bar` value changes are
  width-based and OK because the element is promoted to its own layer.
- All compound animations in this doc use `will-change: transform, opacity`
  only for the duration of the animation (added on start, removed on end).
