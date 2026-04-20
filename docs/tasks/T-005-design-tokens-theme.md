# T-005 — Design tokens & Material theming

**Traces to:** L1-09 / L2-24, L2-46, L2-26 (implementation)
**Depends on:** T-003
**Primary area:** frontend (components library + app)
**Design refs:** `docs/designs/01-design-tokens.md`, `docs/designs/02-theming.md`
**Folder structure:** `docs/folder-structure.md` §5.2
**Status:** Open

## Goal

Install the QuorumQ design tokens (color, type, spacing, radius, elevation,
motion, z-index, breakpoints) and an Angular Material 3 theme (light + dark)
in the `components` library, exposed via `provideQuorumMaterialTheme()`.

## Scope

### `src/web/projects/components/src/lib/tokens/`
- `design-tokens.ts` — exports typed tokens in TypeScript:
  `spacing`, `radius`, `motion` (durations + easing), `zIndex`, `breakpoints`.
  Values come directly from `docs/designs/01-design-tokens.md`.

### `src/web/projects/components/src/lib/theme/`
- `_tokens.scss` — all tokens as SCSS variables (single source of truth
  alongside the TS module).
- `_palettes.scss` — M3 palettes (primary tomato `#E04F3C`, secondary herb
  `#4C8B6B`, tertiary amber `#F2B134`, error, neutral) generated via
  `mat.m2-define-palette` / `mat.define-theme`.
- `_light-theme.scss`, `_dark-theme.scss` — concrete Material 3 themes.
- `theme.provider.ts` — exports `provideQuorumMaterialTheme()` that:
  - Registers animations asynchronously.
  - Provides CDK breakpoints aligned with `docs/designs/README.md` table
    (`xs`, `sm`, `md`, `lg`, `xl`).

### `src/web/projects/app/src/styles/`
- `_tokens.scss` — `@forward` the library tokens.
- `_theme.scss` — applies light theme by default, dark theme under
  `[data-theme='dark']` on `<html>` (so the `ThemeService` in T-038 can
  toggle a single attribute).
- `styles.scss` — global reset, focus-visible ring, `prefers-reduced-motion`
  guards that zero out motion tokens.

### Public API
- Extend `projects/components/src/public-api.ts` to re-export
  `provideQuorumMaterialTheme` and the typed design tokens.

## Rules
- **Never hard-code** color, size, or duration values in features or other
  components — always reference tokens (L2-24).
- The tokens module and SCSS file MUST stay in sync; put the numeric
  constants in one place and generate the other via a tiny
  `scripts/generate-tokens.ts` that is run by an npm script (optional, but
  recommended for radical simplicity).

## ATDD — Failing tests first (L2-35)

No dedicated spec file yet — verified indirectly by T-040 (L2-24 audit) and
T-041 (L2-25 motion). But add a unit-style smoke check:
- `tests/e2e/specs/_smoke/theme-applied.spec.ts`:
  - `[smoke] root element has a Material theme class applied`.

## Folder-structure pointers

- `src/web/projects/components/src/lib/tokens/design-tokens.ts`
- `src/web/projects/components/src/lib/theme/theme.provider.ts`
- `src/web/projects/app/src/styles/_tokens.scss`
- `src/web/projects/app/src/styles/_theme.scss`

## Definition of Done

- [ ] `provideQuorumMaterialTheme()` is the only thing `app.config.ts`
      needs to wire theming.
- [ ] Tokens (TS and SCSS) hold every value enumerated in
      `docs/designs/01-design-tokens.md`.
- [ ] Toggling `<html data-theme='dark'>` in devtools swaps the Material
      theme without reloading.
- [ ] No design value hard-coded in `projects/app/` (spot-check: grep for
      `#` hex colors and numeric pixel values outside tokens).
