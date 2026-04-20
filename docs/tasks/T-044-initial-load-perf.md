# T-044 — Initial load performance

**Traces to:** L1-11 / L2-29
**Depends on:** T-003, T-007, T-019, T-020
**Primary area:** frontend + e2e
**Design refs:** —
**Folder structure:** `docs/folder-structure.md` §6 (`specs/performance/L2-29...`)
**Status:** Open

## Goal

First contentful paint within 1.5 s on a mid-tier mobile over 4G. LCP under
2.5 s, TTI under 3.5 s. Initial JS bundle under 200 KB gzipped.

## Scope

### Frontend perf work
- Confirm lazy-loaded route chunks for every feature under `features/`.
- Server-render the app shell via Angular universal only if needed to hit
  budgets — prefer not to introduce SSR (L2-47) and instead tune CSR:
  - Inline critical CSS for the shell via Angular CLI `inlineCritical`.
  - Defer non-critical Material modules.
  - Avoid `@angular/animations` in routes that don't need it (provided
    asynchronously via T-005).
- Serve production build from the API's `wwwroot` in production (per
  `docs/folder-structure.md` §4).
- Enable HTTP/2 + gzip/brotli in the API pipeline.
- Add `npm run analyze` (source-map-explorer) for bundle inspection.

### E2E
- Playwright project `perf-mobile` that uses Pixel 5 emulation with
  4G throttling (`page.route` for network shaping + CDP for CPU 4× slow).
- Measures LCP and TTI via `PerformanceObserver`.
- Builds the app in production mode before running (`npm run build` from
  root).

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/performance/L2-29.initial-load.spec.ts`:
  - `[L2-29] cold load on throttled 4G produces LCP ≤ 2.5 s`
  - `[L2-29] cold load on throttled 4G produces TTI ≤ 3.5 s`
  - `[L2-29] initial JS bundle sent to mobile is ≤ 200 KB gzipped`

## Folder-structure pointers

- `src/web/projects/app/src/app/app.routes.ts`
- `src/api/Program.cs` (production pipeline: response compression)
- `tests/e2e/specs/performance/L2-29.initial-load.spec.ts`

## Definition of Done

- [ ] Spec passes against a production build.
- [ ] Bundle size check fails CI when over budget.
- [ ] No SSR, no service worker introduced (L2-47 — unless a budget
      failure cannot be fixed otherwise; requires an L2 change first).
