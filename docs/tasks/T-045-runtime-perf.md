# T-045 — Runtime responsiveness

**Traces to:** L1-11 / L2-30
**Depends on:** T-027, T-029, T-035
**Primary area:** frontend + e2e
**Design refs:** —
**Folder structure:** `docs/folder-structure.md` §6 (`specs/performance/L2-30...`)
**Status:** Complete

## Goal

User interactions feel instant: visible feedback within 100 ms; no
interaction blocks the main thread > 50 ms (INP budget).

## Scope

### Frontend
- Use `requestIdleCallback` / `scheduler.postTask` where appropriate for
  heavy work triggered by hub events (rare — Angular signals already
  batch well).
- Virtualize long lists (history, suggestion list) with Angular CDK's
  `ScrollingModule` when counts exceed a threshold.
- Ensure event handlers defer non-essential work off the pointer-up path
  (e.g., vote button invokes API optimistically, animates, and returns).

### E2E
- Measure INP via `performance.getEntries('interaction')` on:
  - Vote button tap.
  - Suggest submit.
  - Winner reveal animation start.
- Use the same throttled mobile project as T-044.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/performance/L2-30.runtime.spec.ts`:
  - `[L2-30] primary action provides visible feedback within 100 ms`
  - `[L2-30] INP under 50 ms across typical interactions on throttled mobile`

## Folder-structure pointers

- `src/web/projects/app/src/app/features/**`
- `tests/e2e/specs/performance/L2-30.runtime.spec.ts`

## Definition of Done

- [x] Spec passes against a production build on the throttled mobile
      project.
- [x] No action blocks the main thread beyond budget.
- [x] Feedback spinner / micro-interaction visible within 100 ms on every
      primary action.
