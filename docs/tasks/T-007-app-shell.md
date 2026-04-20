# T-007 — App shell & responsive navigation

**Traces to:** L1-08 / L2-21, L2-22, L2-23 (implementation)
**Depends on:** T-006
**Primary area:** frontend (app)
**Design refs:** `docs/designs/04-layout-navigation.md`, `docs/designs/14-motion.md`
**Folder structure:** `docs/folder-structure.md` §5.1
**Status:** Open

## Goal

Build the responsive shell — top app bar, bottom navigation on mobile,
navigation rail on tablet, and a persistent drawer / rail + content column
on desktop — so every feature task plugs into a consistent layout.

## Scope

### `src/web/projects/app/src/app/app.component.(ts|html|scss)`
- Router outlet surrounded by:
  - `mat-toolbar` top app bar (brand, active team chip, account menu).
  - `@components/empty-state` shown on the empty root route (no team).
  - Responsive nav (see `Breakpoints` in `docs/designs/README.md`):
    - `xs` / `sm` → bottom `mat-tab-nav-bar` / bottom navigation with
      thumb-reachable primary actions (L2-21).
    - `md` → Material navigation rail on the left.
    - `lg` / `xl` → rail + content + optional detail column (L2-22).
  - `<meta name="viewport" …>` set in `index.html` (part of T-003 — verify).
- Uses `BreakpointObserver` (from `provideQuorumMaterialTheme`, T-005) to
  switch layouts reactively (signals).

### Navigation entries (stubbed)
- `Home` → `/teams` (dashboards).
- `History` → `/history` (T-032).
- `Settings` → `/settings` (T-038).
- Account menu: `Sign out` (T-013), `Settings`, `About`.

### Routes
- Add the top-level lazy-loaded route tree to `app.routes.ts`:
  - `auth` → `features/auth/auth.routes.ts` (stub — T-012/13/14).
  - `teams` → `features/teams/teams.routes.ts` (stub — T-016/17/18).
  - `teams/:teamId/sessions` → `features/sessions/sessions.routes.ts` (stub).
  - `teams/:teamId/history` → `features/history/...` (stub).
  - `settings` → `features/settings/...` (stub).
  - `**` → `features/shared/not-found.page.ts` (simple Material page).

### Rules
- Primary actions on `xs` MUST sit in the bottom third of the viewport
  (L2-21).
- Every interactive element MUST have a visible focus ring and ≥ 44×44 CSS
  px touch target (L2-23).
- No horizontal scrolling at 375 px width (L2-21).

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/responsive/L2-21.mobile-layout.spec.ts`:
  - `[L2-21] at 375px, primary actions are within the bottom third of the viewport`
  - `[L2-21] at 375px, no horizontal scrolling occurs on the shell`
- `tests/e2e/specs/responsive/L2-22.tablet-desktop.spec.ts`:
  - `[L2-22] at 1024px, the layout uses a navigation rail + content column`
  - `[L2-22] at 1920px, content remains legible with a max-width applied`

Page object: `tests/e2e/pages/components/app-shell.component.ts` exposes
`openPrimaryNav()`, `currentLayout()`, `focusSignOut()`, etc.

## Folder-structure pointers

- `src/web/projects/app/src/app/app.component.ts`
- `src/web/projects/app/src/app/app.routes.ts`
- `src/web/projects/app/src/app/features/shared/not-found.page.ts`

## Definition of Done

- [ ] All four browser projects pass the new L2-21 / L2-22 specs.
- [ ] Shell is composed from `@components` primitives and Material
      components — no ad-hoc CSS beyond tokens (L2-24).
- [ ] No `NgModule` introduced; all components standalone (L2-45).
- [ ] `BreakpointObserver` is the single source of truth for layout
      switching (no `@media` hacks in TS).
