# T-040 — Design system consistency audit

**Traces to:** L1-09 / L2-24
**Depends on:** T-005, T-006, and at least one feature screen
  (T-019 is sufficient to start; ideally run after the majority of feature
  tasks land)
**Primary area:** e2e + small UI fixes
**Design refs:** all of `docs/designs/01…16`
**Folder structure:** `docs/folder-structure.md` §6 (`specs/design-system/L2-24...`)
**Status:** Complete

## Goal

Every screen composes components from the design system with no one-off
ad-hoc styles. Typography, spacing, and color usage are visibly consistent.

## Scope

### Static analysis
- Script under `tests/e2e/support/design-audit.ts`:
  - Parses the built CSS and asserts colour values only come from the
    generated Material palette / tokens (`rgb(...)` values are
    cross-checked against the token set).
  - Fails on hardcoded pixel values in component `.scss` that aren't
    sourced from tokens (lint rule with allowlist).

### Runtime audit
- Playwright collects computed styles on a canonical element list across
  a canonical page list:
  - Typography class used must be one of the M3 type scale roles.
  - Spacing multiples must be from the token set.
  - Elevation shadows must come from tokens.

### Fixes
- Any drift found in feature code gets fixed at the source: either the
  feature switches to a `@components/*` primitive, or the primitive is
  extended (L2-47 — prefer library-level fix).

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/design-system/L2-24.design-system.spec.ts`:
  - `[L2-24] every screen uses typography, spacing, and colour drawn from the design tokens`
  - `[L2-24] no one-off hardcoded colour or pixel value appears in the compiled CSS`

## Folder-structure pointers

- `tests/e2e/support/design-audit.ts`
- `tests/e2e/specs/design-system/L2-24.design-system.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes across all browsers.
- [ ] Script-based lint catches future drift (added to root
      `package.json` as `npm run lint:design`).
- [ ] No feature has its own colour / font stack.
- [ ] All fixes land in `@components/*` when possible.
