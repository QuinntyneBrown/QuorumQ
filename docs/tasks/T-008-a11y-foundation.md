# T-008 — Accessibility foundation

**Traces to:** L1-10 / L2-27 (baseline), L2-28 (baseline)
**Depends on:** T-003, T-004
**Primary area:** frontend + e2e
**Design refs:** `docs/designs/15-accessibility.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (core/a11y), §6 (support/a11y.ts)

## Goal

Install the project's accessibility baseline so every feature inherits it:
live announcer service, focus-visible styles, skip-to-content link, axe
wrapper in the E2E harness with a project-wide assertion helper.

## Scope

### `src/web/projects/app/src/app/core/a11y/`
- `live-announcer.ts` — thin service around CDK `LiveAnnouncer` exposing
  `polite(message)` and `assertive(message)`.
- `focus.ts` — `focusFirstError(formRef)`, `restoreFocusTo(el)` helpers.

### `src/web/projects/app/src/styles/`
- Global `:focus-visible` ring using the design token (L2-23, L2-27).
- `.skip-link` style for the skip-to-content anchor in `app.component.html`.

### `src/web/projects/app/src/app/app.component.html`
- Insert `<a class="skip-link" href="#main">Skip to content</a>` as the
  first element and give the router outlet container `id="main"
  tabindex="-1"`.

### `tests/e2e/support/a11y.ts`
- Export `expectAccessible(page, options?)` wrapping `@axe-core/playwright`
  — fails on any `critical` or `serious` violation (L2-27).
- Export `expectLiveRegionAnnouncement(page, text)` that asserts a polite
  or assertive live region emitted the text (L2-28).

### `tests/e2e/pages/base.page.ts`
- Add `expectAccessible()` method delegating to `support/a11y.ts` — every
  feature spec can call `page.expectAccessible()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/a11y/L2-27.wcag-aa.spec.ts` baseline (expanded by T-042):
  - `[L2-27] shell has zero critical/serious axe violations`
  - `[L2-27] skip-to-content link is the first tab stop`
- `tests/e2e/specs/a11y/L2-28.screen-reader.spec.ts` baseline (expanded by
  T-043):
  - `[L2-28] live announcer emits polite messages into an aria-live=polite region`

Page object: `tests/e2e/pages/components/skip-link.component.ts`.

## Folder-structure pointers

- `src/web/projects/app/src/app/core/a11y/live-announcer.ts`
- `tests/e2e/support/a11y.ts`
- `tests/e2e/pages/base.page.ts`

## Definition of Done

- [ ] `expectAccessible()` callable from any page object, fails on critical
      / serious axe violations (L2-27).
- [ ] `live-announcer.ts` covers both polite and assertive channels (L2-28).
- [ ] Skip link is the first focusable element on the shell and jumps to
      `#main`.
- [ ] Focus ring visible on every interactive element in the shell (L2-23).
- [ ] All new specs pass across the four browser projects.
