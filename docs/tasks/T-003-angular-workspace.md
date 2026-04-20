# T-003 — Angular workspace + components library skeleton

**Traces to:** L1-17 / L2-45, L2-46, L2-47, L2-48
**Depends on:** T-001
**Primary area:** frontend
**Design refs:** `docs/designs/README.md`, `docs/designs/02-theming.md`
**Folder structure:** `docs/folder-structure.md` §5

## Goal

Create one Angular CLI workspace under `src/web/` hosting exactly two
projects: the deployable `app` SPA and the `components` library. Standalone
components only — no `NgModule` declarations.

## Scope

### Frontend (`src/web/`)
- Generate the workspace with Angular CLI (current supported version).
- `angular.json` configures two projects:
  - `app` — application type, entry `projects/app/src/main.ts`.
  - `components` — library type built with `ng-packagr`, entry
    `projects/components/src/public-api.ts`.
- Root `tsconfig.json` declares path aliases:
  - `@app/*` → `projects/app/src/app/*`
  - `@components` → `projects/components/src/public-api`
- `projects/app/`:
  - `main.ts` calls `bootstrapApplication(AppComponent, appConfig)`.
  - `app/app.component.ts` with router outlet and theme host.
  - `app/app.config.ts` wires `provideRouter`, `provideHttpClient`,
    `provideAnimationsAsync`, `provideQuorumMaterialTheme()` (the provider
    from T-005).
  - `app/app.routes.ts` — empty lazy-loaded route array for now.
  - Feature folders under `app/features/` (empty placeholders only — each
    feature task fills its folder).
  - `core/` folder with empty placeholder files for `api/`, `auth/`,
    `realtime/`, `theme/`, `a11y/`.
  - `styles/styles.scss` importing `_tokens.scss` and `_theme.scss` (files
    created as stubs — filled by T-005).
  - `environments/environment.ts` + `.production.ts` with `apiBaseUrl` and
    `hubUrl`.
- `projects/components/`:
  - `public-api.ts` exporting empty surface for now (filled by T-005/T-006).
  - `lib/` folder for primitives (added by T-006).
- Install Angular Material; verify `@angular/cdk`, `@angular/animations`.
- Install `openapi-typescript` as a dev dep; add `npm run generate:api`
  pointing at `http://localhost:5000/openapi/v1.json` → output
  `projects/app/src/app/core/api/generated/`. Generated folder is
  gitignored.
- Root `package.json` adds an umbrella `dev:web` script pointing into
  `src/web/`.

### Rules
- **No `NgModule`s.** Standalone components only (L2-45).
- **No state-management library** (L2-45, L2-47). State lives in signals
  and a handful of services under `core/`.
- **No UI framework besides Angular Material** (L2-46).

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/_smoke/app-up.spec.ts`:
  - `[smoke] Angular app boots and renders root shell`.

## Folder-structure pointers

- `src/web/angular.json`
- `src/web/tsconfig.json`
- `src/web/projects/app/src/app/app.component.ts`
- `src/web/projects/app/src/app/app.config.ts`
- `src/web/projects/app/src/app/app.routes.ts`
- `src/web/projects/components/src/public-api.ts`

## Definition of Done

- [ ] `ng build app` and `ng build components` both succeed.
- [ ] `ng serve app` renders an empty shell without errors.
- [ ] Only two projects exist in `angular.json`: `app` and `components`.
- [ ] No `NgModule` declarations anywhere (grep `@NgModule` returns nothing
      in `projects/`).
- [ ] `openapi-typescript` generator configured; running it against T-002's
      OpenAPI emits types into the gitignored folder.
- [ ] Path aliases `@app/*` and `@components` resolve in both `app` and
      build output.
