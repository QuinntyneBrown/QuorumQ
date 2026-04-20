# T-006 — Components library primitives

**Traces to:** L1-09 / L2-24, L2-46, L2-47
**Depends on:** T-005
**Primary area:** frontend (components library)
**Design refs:** `docs/designs/03-components.md`, `docs/designs/11-dialogs.md`,
`docs/designs/12-errors-empty-states.md`, `docs/designs/16-icons-imagery.md`
**Folder structure:** `docs/folder-structure.md` §5.2
**Status:** Complete

## Goal

Build the small set of reusable primitives in `projects/components/src/lib/`
by composing Angular Material. These are the only UI building blocks feature
code should reach for; features never style Material directly.

## Scope

### Components (each in its own folder under `lib/`)
- `button/` — thin wrapper around `matButton` variants (`filled`,
  `tonal`, `text`, `icon`). Enforces the min 44×44 touch target (L2-23) and
  applies motion tokens.
- `card/` — wrapper around `mat-card` with the project's elevation +
  radius tokens.
- `session-card/` — specialisation: session status chip, countdown slot,
  action row. Stateless; consumers provide inputs.
- `countdown/` — visual countdown primitive. Accepts a deadline, emits
  `ended` event, respects `prefers-reduced-motion`.
- `vote-tally/` — animated tally bar; accepts a `votes` input and animates
  to the new value.
- `winner-reveal/` — animated reveal container (L2-15 / L2-25). Exposes
  `reveal(winner)` API; implementation in T-029 wires it to session state.
- `avatar/` — circular image + initials fallback; used for presence (T-023).
- `presence-indicator/` — dot beside avatar; pulse animation.
- `empty-state/` — illustration slot + title + description + CTA slot.
- `confirm-dialog/` — opinionated `MatDialog` wrapper with cancel / confirm
  actions and `destructive` flag for error-coloured confirm.

### Exports
- Update `projects/components/src/public-api.ts` to export all components,
  their inputs/outputs, and token types.

### Rules
- **Compose Material; never replace it** (L2-46). Any component that can be
  expressed as a Material primitive plus theming must be that.
- **No feature logic.** These components know nothing about sessions, votes,
  or API calls (L2-47 — keep the library reusable).
- **Each component ships its own `.scss`** using only tokens from T-005.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/_smoke/components-gallery.spec.ts`:
  - `[smoke] components render with theme tokens applied` — renders a
    throwaway route in the app that imports the primitives (gated behind
    a `?gallery` query to avoid shipping in prod).

Detailed component behaviour is exercised by the feature specs later.

## Folder-structure pointers

- `src/web/projects/components/src/lib/button/`
- `src/web/projects/components/src/lib/card/`
- `src/web/projects/components/src/lib/session-card/`
- `src/web/projects/components/src/lib/countdown/`
- `src/web/projects/components/src/lib/vote-tally/`
- `src/web/projects/components/src/lib/winner-reveal/`
- `src/web/projects/components/src/lib/avatar/`
- `src/web/projects/components/src/lib/presence-indicator/`
- `src/web/projects/components/src/lib/empty-state/`
- `src/web/projects/components/src/lib/confirm-dialog/`

## Definition of Done

- [ ] `ng build components` succeeds.
- [ ] Every component has a sibling `index.ts` exporting the component and
      its public inputs/outputs.
- [ ] `public-api.ts` is the single entry point (no deep imports from
      `app/` — checked by path-alias rules from T-003).
- [ ] No feature-specific types (e.g. `Session`, `Vote`) imported in the
      library (L2-47).
- [ ] Primitives are keyboard and screen-reader operable — `role`, `aria-*`,
      and focus management verified with `expectAccessible()` in the smoke
      spec.
