# T-041 — Motion & reduced motion

**Traces to:** L1-09 / L2-25
**Depends on:** T-029, T-027, T-006
**Primary area:** frontend + e2e
**Design refs:** `docs/designs/14-motion.md`
**Folder structure:** `docs/folder-structure.md` §6 (`specs/design-system/L2-25...`)
**Status:** Assigned

## Goal

Key transitions (winner reveal, vote tally changes, state transitions) use
fluid, purposeful animation at 60 fps. Users with `prefers-reduced-motion:
reduce` get non-essential animations suppressed.

## Scope

### Implementation checks
- Every animation uses the motion tokens from T-005 (duration + easing).
- All library components (`@components/*`) already respect
  `@media (prefers-reduced-motion: reduce)` — verify and patch as needed.
- Feature-level animations (hub-event fades, list item collapse) go
  through CSS classes gated on reduced motion.

### E2E
- Playwright `emulateMedia({ reducedMotion: 'reduce' })` toggled per test.
- Frame timing: when not reduced, measure `PerformanceObserver` for
  long animation frames during the winner reveal and vote tally change;
  fail if the 95th percentile crosses 16.7 ms.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/design-system/L2-25.motion.spec.ts`:
  - `[L2-25] casting a vote animates the tally smoothly to its new value (60 fps)`
  - `[L2-25] user with prefers-reduced-motion=reduce does not see non-essential animations`

## Folder-structure pointers

- `src/web/projects/components/src/lib/vote-tally/`
- `src/web/projects/components/src/lib/winner-reveal/`
- `tests/e2e/specs/design-system/L2-25.motion.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes across all browsers.
- [ ] Reduced-motion path verified with zero non-essential transitions
      observed.
- [ ] All animations sourced from design-system motion tokens.
