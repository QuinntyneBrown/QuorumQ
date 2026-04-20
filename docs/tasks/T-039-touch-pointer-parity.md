# T-039 — Touch / pointer / keyboard parity audit

**Traces to:** L1-08, L1-10 / L2-23
**Depends on:** T-007, T-027, T-030 (needs interactive features to audit)
**Primary area:** e2e + small UI fixes discovered in audit
**Design refs:** `docs/designs/15-accessibility.md`, `docs/designs/03-components.md`
**Folder structure:** `docs/folder-structure.md` §6 (`specs/responsive/L2-23...`)

## Goal

Every interactive element is operable via tap, mouse click, and keyboard
with a visible focus indicator. Touch targets are at least 44×44 CSS pixels.

## Scope

### Audit
- Enumerate every interactive element in the app (buttons, inputs,
  switches, autocomplete, star rating, nav items, vote buttons, etc.).
- For each, verify in Chromium + mobile Chrome (touch) + Firefox
  (keyboard) + WebKit:
  - Reachable by tab.
  - Operable via `Enter` / `Space` / `Arrow` keys where appropriate.
  - Visible focus ring using the design token (L2-27).
  - Bounding box ≥ 44×44 CSS pixels at 375 px width (L2-23).
- Fix any regressions found in feature components or `@components/*` —
  prefer library-level fixes so they apply uniformly (L2-47).

### E2E
- `tests/e2e/pages/components/interactive-probe.ts` — helper that walks
  an element list and asserts size + focusability.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/responsive/L2-23.touch-pointer-parity.spec.ts`:
  - `[L2-23] every interactive element in the shell is reachable and operable via keyboard with a visible focus ring`
  - `[L2-23] every interactive element meets a 44×44 CSS pixel touch target at 375 px`

Walk a canonical list of pages: sign-in, team dashboard, session
(suggesting + voting states), winner reveal, history, settings.

## Folder-structure pointers

- `tests/e2e/specs/responsive/L2-23.touch-pointer-parity.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes across all four browser projects.
- [ ] Zero elements below the 44×44 px threshold at 375 px.
- [ ] Any fixes land in `@components/*` when primitives are undersized.
