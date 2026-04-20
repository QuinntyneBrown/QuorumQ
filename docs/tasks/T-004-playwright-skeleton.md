# T-004 — Playwright E2E skeleton

**Traces to:** L1-12, L1-13 / L2-31, L2-32, L2-33, L2-34, L2-36
**Depends on:** T-001 (foundational structure); T-002 and T-003 should
exist before the smoke tests in those tasks can actually pass, but this
task itself can start in parallel with them.
**Primary area:** e2e
**Design refs:** —
**Folder structure:** `docs/folder-structure.md` §6
**Status:** Assigned

## Goal

Establish the Playwright suite with strict Page Object Model, deterministic
fixtures, cross-browser projects (including mobile Chrome), and an L2
traceability reporter. Every later feature task adds its own spec under this
harness.

## Scope

### Tests (`tests/e2e/`)
- `package.json` with `@playwright/test`, `@axe-core/playwright`, `zod` for
  fixture validation, and nothing that overlaps with the app's runtime deps.
- `playwright.config.ts`:
  - Projects: `chromium`, `firefox`, `webkit`, `mobile-chrome` (Pixel 5)
    (L2-33).
  - `globalSetup`, `globalTeardown` pointing to `global-setup.ts` /
    `global-teardown.ts`.
  - Reporter list includes the built-in HTML reporter **and** the custom
    traceability reporter (`reporters/traceability-reporter.ts`) that emits
    an L2-id → test-title matrix after a run (L2-36).
  - `use.trace = 'retain-on-failure'`, screenshots on failure.
  - `use.baseURL` from `process.env.WEB_BASE_URL` (defaulted to
    `http://localhost:4200`).
- `global-setup.ts`:
  - Starts API (T-002) and web (T-003) if not already up (simple `spawn`
    wrappers with readiness probes). In CI, servers are launched by the
    workflow and this step just waits.
  - Seeds deterministic data via the API, not the database (L2-34), using
    `support/api-client.ts`.
- `pages/base.page.ts`:
  - `goto(path)`, `waitForToast()`, `expectAccessible()` wrapping axe,
    `expectNoCLS()` helper.
- `pages/components/` — stubs for `app-shell.component.ts`,
  `nav-bar.component.ts`, `toast.component.ts` (each empty POM class).
- `pages/` — empty subfolders `auth/`, `teams/`, `sessions/`,
  `suggestions/`, `voting/`, `restaurants/` with `.gitkeep`.
- `fixtures/`:
  - `app.fixture.ts` — base fixture composing `auth`, `team`, `session`
    fixtures.
  - `auth.fixture.ts`, `team.fixture.ts`, `session.fixture.ts` — each
    fixture provisions its isolated data via `support/api-client.ts` and
    tears down in scope (L2-34).
- `support/`:
  - `api-client.ts` — thin fetch wrapper against the API.
  - `test-data.ts` — factories for users, teams, sessions.
  - `selectors.ts` — shared `data-testid` constants used by page objects.
  - `a11y.ts` — axe wrapper that fails on any critical/serious violation
    (L2-27 baseline).
  - `time.ts` — clock helpers for deterministic countdowns.
  - `realtime.ts` — multi-context helpers for L2-19/20.
- `reporters/traceability-reporter.ts` — parses test titles for `[L2-XX]`
  tokens and writes `tests/e2e/playwright/traceability.json` + a markdown
  table. Failing every L2 in `docs/specs/L2.md` with no covering test is a
  warning (hard failure can be introduced once baseline coverage lands).
- `specs/_smoke/` — seed the pattern with a placeholder smoke spec that
  hits `GET /health` so that T-002 can drop its smoke test here.
- `.eslintrc.json` banning raw `page.locator`/`page.$` usage inside
  `specs/**` (L2-32 enforcement).

### Root
- `package.json` `test:e2e` script delegates to `npx playwright test`
  inside `tests/e2e/`.

## ATDD — Failing tests first (L2-35)

This task stands up the harness. It must enable the per-L2 spec files listed
in `docs/folder-structure.md` §6.

## Folder-structure pointers

- `tests/e2e/playwright.config.ts`
- `tests/e2e/pages/base.page.ts`
- `tests/e2e/support/*.ts`
- `tests/e2e/fixtures/*.ts`
- `tests/e2e/reporters/traceability-reporter.ts`

## Definition of Done

- [ ] `npm run test:e2e` runs (even with zero feature specs) across all
      four browser projects (L2-33).
- [ ] ESLint rule blocks raw selectors in `specs/**` (L2-32).
- [ ] Traceability reporter emits a markdown + JSON matrix after a run
      (L2-36).
- [ ] Each fixture creates and tears down its own data; no `beforeAll`
      shared mutable state (L2-34).
- [ ] Page object base class exposes `goto`, `waitForToast`,
      `expectAccessible`.
- [ ] No raw CSS class / XPath selectors in any file under `specs/` (none
      expected yet — rule is enforced for future tasks).
