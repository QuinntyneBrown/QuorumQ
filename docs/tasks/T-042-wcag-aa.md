# T-042 — WCAG 2.1 AA audit

**Traces to:** L1-10 / L2-27
**Depends on:** T-008, and at least all the feature tasks whose screens
are in scope — run this as the last quality gate before release.
**Primary area:** e2e + small UI fixes discovered in audit
**Design refs:** `docs/designs/15-accessibility.md`
**Folder structure:** `docs/folder-structure.md` §6 (`specs/a11y/L2-27...`)

## Goal

Every screen meets WCAG 2.1 AA for color contrast, keyboard operability,
focus management, and semantic structure. Automated tools report zero
critical or serious violations.

## Scope

### Audit coverage
- Every page/route in the app is visited by the spec, which runs axe
  through `tests/e2e/support/a11y.ts` (T-008). Failing criticals/serious
  fail the build.
- Manual keyboard pass checklist documented in the spec file comments:
  every page operable without a pointer.

### Fix policy
- Fixes land as close to the root cause as possible:
  - Colour contrast issues → token value change in T-005 (check both
    themes).
  - Missing labels → per-component fix, ideally in `@components/*`.
  - Focus traps → use Angular CDK `FocusTrap`; no custom code.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/a11y/L2-27.wcag-aa.spec.ts` (expanded from the
  baseline added in T-008):
  - `[L2-27] text has at least 4.5:1 contrast against its background on every route`
  - `[L2-27] every interactive element is reachable and operable via keyboard with a visible focus ring`
  - `[L2-27] zero critical or serious axe violations reported on every route`

## Folder-structure pointers

- `tests/e2e/specs/a11y/L2-27.wcag-aa.spec.ts`
- `tests/e2e/support/a11y.ts` (T-008)

## Definition of Done

- [ ] Audit spec iterates over the canonical route list and passes.
- [ ] All fixes land at the primitive / token level where possible.
- [ ] CI fails if any critical or serious axe violation re-appears.
