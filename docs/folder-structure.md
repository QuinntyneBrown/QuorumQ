# Folder Structure

This document defines the **expected** folder structure for the QuorumQ
solution. It is derived from and enforced by the requirements in
[`specs/L1.md`](specs/L1.md) and [`specs/L2.md`](specs/L2.md) — most notably
**L2-44** (single ASP.NET Core Web API with no speculative layering),
**L2-45/46** (single Angular app using Angular Material), **L2-47** (radical
simplicity), **L2-48** (flat single-repo layout), and **L2-32** (Playwright
Page Object Model under `tests/e2e/pages/`).

If any change to the repository would deviate from the layout below, it must
either update this document and the corresponding L2 requirement, or be
rejected.

---

## 1. Guiding Principles

1. **One obvious place for each thing.** There are exactly three top-level
   folders the product cares about: `src/`, `tests/`, and `docs/` (L2-48).
2. **No speculative layers.** The backend is a single ASP.NET Core Web API
   project. No `Application`, `Domain`, `Infrastructure`, `MediatR`, `CQRS`,
   or repository projects (L2-44, L2-47).
3. **One SPA, one workspace, two Angular projects.** The frontend is a single
   Angular CLI workspace hosting two projects: the deployable `app` and a
   `components` library that encapsulates the design system (L2-24, L2-45,
   L2-46, and the explicit workspace-with-projects architecture directive).
4. **Selectors live in page objects, never in specs.** All Playwright
   selectors belong in page-object classes under `tests/e2e/pages/`. Spec
   files read like user stories (L2-32).
5. **Traceability is mechanical.** E2E test titles and file names embed the
   L2 identifier they verify (L2-36).

---

## 2. Repository Root

```
QuorumQ/
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                  # build + unit tests + lint
│       └── e2e.yml                 # Playwright against a built API + web
├── global.json                     # pinned .NET SDK version
├── QuorumQ.sln                     # .NET solution file
├── package.json                    # root scripts only (dev, build, e2e)
├── README.md
├── docs/
├── src/
└── tests/
```

**Root-level rules**

- No code lives at the repository root. The root contains solution files,
  tooling configuration, CI, and the three product folders.
- The root `package.json` exposes only umbrella scripts (`dev`, `build`,
  `test:e2e`) that delegate into `src/web/` and `tests/e2e/`. It declares no
  application dependencies of its own.
- Any new top-level folder requires a corresponding L2 change (L2-48).

---

## 3. Documentation — `docs/`

```
docs/
├── folder-structure.md             # this file
└── specs/
    ├── L1.md                       # high-level requirements
    └── L2.md                       # detailed requirements with ATDD criteria
```

Additional design documents (ADRs, detailed designs, ICDs) land in
`docs/adr/`, `docs/design/`, etc., created only when first needed.

---

## 4. Backend — `src/api/`

A **single** ASP.NET Core Web API project. Minimal APIs are preferred; thin
controllers are acceptable. Endpoints are grouped by resource in small files.
No mediator, no CQRS pipeline, no repository interfaces — the `DbContext` is
used directly (L2-44, L2-47).

```
src/api/
├── Api.csproj
├── Program.cs                      # composition root; wires DI + pipeline
├── appsettings.json
├── appsettings.Development.json
├── Endpoints/                      # one file per resource
│   ├── AuthEndpoints.cs
│   ├── TeamEndpoints.cs
│   ├── SessionEndpoints.cs
│   ├── SuggestionEndpoints.cs
│   ├── VoteEndpoints.cs
│   ├── CommentEndpoints.cs
│   ├── ReviewEndpoints.cs
│   └── HistoryEndpoints.cs
├── Hubs/
│   └── SessionHub.cs               # SignalR — real-time (L1-07, L2-19/20)
├── Data/
│   ├── AppDbContext.cs             # single EF Core DbContext
│   ├── SeedData.cs                 # test/dev seeding (L2-34)
│   └── Migrations/
├── Models/                         # entities + request/response DTOs
│   ├── Team.cs
│   ├── Membership.cs
│   ├── User.cs
│   ├── LunchSession.cs
│   ├── Restaurant.cs
│   ├── Suggestion.cs
│   ├── Vote.cs
│   ├── Comment.cs
│   └── Review.cs
├── Auth/
│   ├── AuthOptions.cs
│   └── TeamMembershipPolicy.cs     # authorization for team data (L2-41)
└── wwwroot/                        # optional: hosts Angular build output
```

**Backend rules**

- No `Services/` "manager" layer. Business rules that do not belong in EF
  entity methods live inline in endpoint handlers; factor out a static
  helper only when the same logic appears in two endpoints.
- `Models/` holds both persistence entities and request/response DTOs. Keep
  them separate types but co-located — do not split into `Entities/` and
  `Dtos/` subfolders unless the count forces it.
- OpenAPI is exposed in Development only (L2-44). The generated schema is
  consumed by the Angular app via `openapi-typescript`.
- Integration and unit tests for the API live in `tests/api/` (not shown
  under `src/`), introduced only when a requirement demands coverage that
  E2E cannot reach.

---

## 5. Frontend — `src/web/` (Angular Workspace)

A single Angular CLI workspace that contains exactly **two projects**:

| Project       | Type        | Role                                                                 |
| ------------- | ----------- | -------------------------------------------------------------------- |
| `app`         | application | The deployable QuorumQ SPA.                                          |
| `components`  | library     | Shared UI primitives/design-system composed from Angular Material.   |

`app` depends on `components`. `components` has no dependency on `app`.

```
src/web/
├── angular.json                    # workspace: 2 projects (app, components)
├── package.json                    # app + library dependencies
├── package-lock.json
├── tsconfig.json                   # workspace-level tsconfig with paths
├── tsconfig.spec.json
├── .eslintrc.json
├── .browserslistrc
├── karma.conf.js                   # (only if unit tests are introduced)
├── README.md
└── projects/
    ├── app/
    └── components/
```

### 5.1 Application project — `projects/app/`

```
projects/app/
├── project.json                    # if Nx is ever adopted (not required)
├── tsconfig.app.json
├── tsconfig.spec.json
├── src/
│   ├── index.html
│   ├── main.ts                     # bootstrapApplication(AppComponent, …)
│   ├── styles/
│   │   ├── _tokens.scss            # design tokens (colors, spacing, motion)
│   │   ├── _theme.scss             # Angular Material light + dark palettes
│   │   └── styles.scss             # global styles entry
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.production.ts
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   └── app/
│       ├── app.component.ts        # root shell (router outlet, theme host)
│       ├── app.component.html
│       ├── app.component.scss
│       ├── app.config.ts           # providers: router, http, material, etc.
│       ├── app.routes.ts           # top-level routes — lazy-loaded
│       ├── core/                   # singletons that cross features
│       │   ├── api/
│       │   │   ├── api-client.ts   # thin HttpClient wrapper
│       │   │   ├── generated/      # openapi-typescript output (gitignored)
│       │   │   └── interceptors/
│       │   │       ├── auth.interceptor.ts
│       │   │       └── error.interceptor.ts
│       │   ├── auth/
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.guard.ts
│       │   │   └── session.store.ts
│       │   ├── realtime/
│       │   │   └── session-hub.client.ts   # SignalR client
│       │   ├── theme/
│       │   │   └── theme.service.ts        # dark/light (L2-26)
│       │   └── a11y/
│       │       └── live-announcer.ts       # wraps Material LiveAnnouncer
│       ├── features/               # one folder per feature — all standalone
│       │   ├── auth/
│       │   │   ├── sign-in.page.ts
│       │   │   ├── sign-up.page.ts
│       │   │   └── auth.routes.ts
│       │   ├── teams/
│       │   │   ├── team-dashboard.page.ts
│       │   │   ├── team-invite.page.ts
│       │   │   ├── team-switcher.component.ts
│       │   │   └── teams.routes.ts
│       │   ├── sessions/
│       │   │   ├── session.page.ts
│       │   │   ├── start-session.page.ts
│       │   │   ├── winner-reveal.page.ts
│       │   │   └── sessions.routes.ts
│       │   ├── suggestions/
│       │   │   ├── suggestion-list.component.ts
│       │   │   ├── suggest-restaurant.component.ts
│       │   │   └── restaurant-autocomplete.component.ts
│       │   ├── voting/
│       │   │   ├── vote-button.component.ts
│       │   │   └── vote-tally.component.ts
│       │   ├── comments/
│       │   │   └── comment-thread.component.ts
│       │   ├── reviews/
│       │   │   └── review-form.component.ts
│       │   ├── history/
│       │   │   ├── session-history.page.ts
│       │   │   └── restaurant-profile.page.ts
│       │   ├── notifications/
│       │   │   └── notification.service.ts
│       │   └── settings/
│       │       └── settings.page.ts
│       └── shared/                 # cross-feature pipes, directives, utils
│           ├── pipes/
│           └── directives/
```

**App project rules**

- **Standalone components only.** No `NgModule` declarations (L2-45).
- **Feature folders are self-contained.** A feature owns its routes, pages,
  and components. Cross-feature reuse goes either to `shared/` (small stuff)
  or `components/` library (design-system primitives).
- **One page component per route.** Files ending in `.page.ts` are router
  destinations. Files ending in `.component.ts` are composable pieces.
- **Path aliases.** `tsconfig.json` maps `@app/*` → `projects/app/src/app/*`
  and `@components` → `projects/components/src/public-api`. No deep imports
  into `components/src/lib/...` from `app/`.
- **No ad-hoc styling.** Every interactive element is an Angular Material
  component or a wrapper from `components/` (L2-24, L2-46). One-off styles
  that are not derived from design tokens fail review.

### 5.2 Components library project — `projects/components/`

Publishable Angular library (via `ng-packagr`) that hosts the **design
system**: wrapped Angular Material components with project theming,
motion, and a11y baked in.

```
projects/components/
├── ng-package.json
├── package.json                    # library-specific dependencies
├── tsconfig.lib.json
├── tsconfig.lib.prod.json
├── tsconfig.spec.json
├── README.md
└── src/
    ├── public-api.ts               # single entry point — exports everything
    ├── test.ts
    └── lib/
        ├── theme/
        │   └── theme.provider.ts   # provideQuorumMaterialTheme()
        ├── tokens/
        │   └── design-tokens.ts    # spacing, radii, motion curves
        ├── button/
        │   ├── button.component.ts
        │   ├── button.component.html
        │   ├── button.component.scss
        │   └── index.ts
        ├── card/
        ├── session-card/
        ├── countdown/
        ├── vote-tally/
        ├── winner-reveal/          # animated reveal (L2-15, L2-25)
        ├── avatar/
        ├── presence-indicator/     # L2-20
        ├── empty-state/
        └── confirm-dialog/
```

**Library rules**

- **Wraps Angular Material; never replaces it.** A library component either
  composes Material primitives or adds motion/theming on top. No parallel
  UI framework (L2-46).
- **Export surface is `public-api.ts` only.** Consumers never deep-import.
- **No feature logic.** The library has no knowledge of lunch sessions,
  votes, or API calls. It stays reusable and demo-friendly.
- **Each component has a sibling `.stories.ts`** if Storybook is added
  later; until then, components are previewed from `app/`.

---

## 6. End-to-End Tests — `tests/e2e/`

Playwright suite using the **Page Object Model** (L2-32). Tests read as
plain user scenarios; selectors and page-specific interactions live only in
page classes. Every test file and title embeds its L2 identifier (L2-36).

```
tests/e2e/
├── package.json
├── playwright.config.ts            # projects: chromium, firefox, webkit,
│                                   #   mobile-chrome (L2-33)
├── tsconfig.json
├── .eslintrc.json
├── global-setup.ts                 # boot API + web, seed deterministic data
├── global-teardown.ts
├── pages/                          # Page Object Model — the only place
│   │                               #   raw selectors are allowed
│   ├── base.page.ts                # navigation, waits, a11y helpers
│   ├── components/                 # reusable widget POMs (not full pages)
│   │   ├── app-shell.component.ts
│   │   ├── nav-bar.component.ts
│   │   ├── toast.component.ts
│   │   ├── countdown.component.ts
│   │   └── vote-tally.component.ts
│   ├── auth/
│   │   ├── sign-in.page.ts
│   │   └── sign-up.page.ts
│   ├── teams/
│   │   ├── team-dashboard.page.ts
│   │   ├── team-invite.page.ts
│   │   └── team-switcher.page.ts
│   ├── sessions/
│   │   ├── start-session.page.ts
│   │   ├── session.page.ts
│   │   ├── winner-reveal.page.ts
│   │   └── session-history.page.ts
│   ├── suggestions/
│   │   └── suggestion-form.page.ts
│   ├── voting/
│   │   └── vote-panel.page.ts
│   └── restaurants/
│       └── restaurant-profile.page.ts
├── specs/                          # one subfolder per feature area;
│   │                               #   one file per L2 requirement
│   ├── team-membership/
│   │   ├── L2-01.create-team.spec.ts
│   │   ├── L2-02.invite-members.spec.ts
│   │   └── L2-03.multiple-teams.spec.ts
│   ├── auth/
│   │   ├── L2-04.sign-up.spec.ts
│   │   ├── L2-05.sign-in-out.spec.ts
│   │   └── L2-06.session-persistence.spec.ts
│   ├── sessions/
│   │   ├── L2-07.start-session.spec.ts
│   │   ├── L2-08.session-states.spec.ts
│   │   └── L2-09.view-active-session.spec.ts
│   ├── suggestions/
│   │   ├── L2-10.suggest-restaurant.spec.ts
│   │   ├── L2-11.reuse-past.spec.ts
│   │   └── L2-12.withdraw.spec.ts
│   ├── voting/
│   │   ├── L2-13.cast-vote.spec.ts
│   │   ├── L2-14.tie-breaking.spec.ts
│   │   └── L2-15.announce-winner.spec.ts
│   ├── comments/
│   │   ├── L2-16.comment.spec.ts
│   │   ├── L2-17.review.spec.ts
│   │   └── L2-18.restaurant-profile.spec.ts
│   ├── realtime/
│   │   ├── L2-19.real-time-updates.spec.ts
│   │   └── L2-20.presence.spec.ts
│   ├── responsive/
│   │   ├── L2-21.mobile-layout.spec.ts
│   │   ├── L2-22.tablet-desktop.spec.ts
│   │   └── L2-23.touch-pointer-parity.spec.ts
│   ├── design-system/
│   │   ├── L2-24.design-system.spec.ts
│   │   ├── L2-25.motion.spec.ts
│   │   └── L2-26.themes.spec.ts
│   ├── a11y/
│   │   ├── L2-27.wcag-aa.spec.ts
│   │   └── L2-28.screen-reader.spec.ts
│   ├── performance/
│   │   ├── L2-29.initial-load.spec.ts
│   │   └── L2-30.runtime.spec.ts
│   ├── history/
│   │   ├── L2-37.session-history.spec.ts
│   │   └── L2-38.export-csv.spec.ts
│   ├── notifications/
│   │   ├── L2-39.in-app.spec.ts
│   │   └── L2-40.preferences.spec.ts
│   └── security/
│       ├── L2-41.team-isolation.spec.ts
│       ├── L2-42.transport-storage.spec.ts
│       └── L2-43.account-deletion.spec.ts
├── fixtures/                       # Playwright test fixtures
│   ├── app.fixture.ts              # base fixture — composes the rest
│   ├── auth.fixture.ts             # signed-in user contexts
│   ├── team.fixture.ts             # creates an isolated team per test
│   └── session.fixture.ts          # seeds a session in a given state
├── support/
│   ├── api-client.ts               # hits the API to seed data (L2-34)
│   ├── test-data.ts                # factories for users, teams, sessions
│   ├── selectors.ts                # shared `data-testid` constants
│   ├── a11y.ts                     # @axe-core/playwright wrapper
│   ├── time.ts                     # deterministic clock helpers
│   └── realtime.ts                 # multi-context helpers for L2-19/20
├── reporters/
│   └── traceability-reporter.ts    # emits a matrix of L2 id → test(s)
└── playwright/                     # playwright-managed artifacts
    ├── .cache/                     # gitignored
    └── test-results/               # gitignored
```

### 6.1 Page Object Model conventions

- **Only page classes touch selectors.** Anything under `pages/` may call
  `page.getByRole`, `page.locator`, etc.; nothing under `specs/` may.
- **Intention-revealing methods.** A page class exposes verbs drawn from
  the domain (`signIn`, `suggestRestaurant`, `castVoteFor`, `withdraw`) —
  not DOM verbs (`clickButton`, `fillInput`). This satisfies L2-32.
- **`base.page.ts`** provides shared primitives: `goto`, `waitForToast`,
  `expectAccessible` (axe run), `expectNoCLS`. Concrete pages extend it.
- **Component POMs** (`pages/components/`) model reusable widgets that
  appear inside many pages (toasts, nav bar, countdown). A page composes
  component POMs rather than duplicating their selectors.
- **Selector strategy.** Prefer `getByRole` and `getByLabel` for a11y
  alignment (supports L2-27/28); fall back to `data-testid` constants from
  `support/selectors.ts`. Never rely on CSS classes or XPath.

### 6.2 Spec file conventions

- **File name:** `L2-XX.short-slug.spec.ts`.
- **First line of every `test(...)`:** `` `[L2-XX] <behaviour>` `` (L2-36).
- **One L2 requirement per file.** If a single L2 requirement has many
  acceptance criteria, each becomes its own `test(...)` in the same file.
- **No `beforeAll` state leakage.** Each test provisions its own team and
  users via fixtures (L2-34).
- **Real-time tests** use two browser contexts through `support/realtime.ts`
  to prove cross-client updates (L2-19).

### 6.3 Fixtures and test data

- `app.fixture.ts` is the single fixture spec files import; it composes
  `auth`, `team`, and `session` fixtures.
- Each fixture provisions data via direct API calls in `support/api-client.ts`
  against the running backend and tears it down in its own scope — never
  through the UI — keeping tests fast and deterministic.
- No fixture reaches into the database directly; seeding goes through the
  API to keep tests aligned with real usage and authorization (L2-41).

---

## 7. When adding a new feature

A new L2 requirement flows through the structure in a fixed order, which
enforces ATDD (L2-35):

1. **Specs** — the L2 entry already exists in `docs/specs/L2.md`.
2. **Page object(s)** — create or extend files under `tests/e2e/pages/`
   expressing the new user-facing interactions.
3. **Failing spec** — add `tests/e2e/specs/<area>/L2-XX.<slug>.spec.ts`.
   Confirm it fails.
4. **Backend** — add endpoints in `src/api/Endpoints/`, entities in
   `Models/`, migrations in `Data/Migrations/`.
5. **Frontend** — add or extend a feature folder in
   `src/web/projects/app/src/app/features/...`, composing primitives from
   `projects/components/`.
6. **Library growth** — only if the same UI pattern now appears in two or
   more features, promote it to `projects/components/src/lib/...`.
7. **Green** — the spec passes. No unrelated code changes ride along
   (L2-47).

---

## 8. What this layout deliberately excludes

To defend radical simplicity (L2-47), the following are **not** part of
the expected structure and require an L2 change before introduction:

- `src/application/`, `src/domain/`, `src/infrastructure/` or any other
  backend layering beyond `src/api/`.
- A BFF, API gateway, GraphQL layer, or separate "contracts" project.
- NgRx, Akita, or any third-party state-management library in the Angular
  app; state lives in component signals and a handful of services under
  `core/`.
- A separate design-tokens package; tokens live in
  `projects/components/src/lib/tokens/` and in `app/src/styles/_tokens.scss`.
- A dedicated monorepo tool (Nx, Turborepo). The Angular CLI workspace and
  a handful of root npm scripts are sufficient.
- Additional top-level folders (`packages/`, `libs/`, `apps/`, `shared/`).

---

## 9. Traceability

| L1 / L2                            | Structural element                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| L1-17 / L2-44                       | `src/api/` as a single ASP.NET Core Web API project; no other backend folders.     |
| L1-17 / L2-45                       | `src/web/` as a single Angular CLI workspace; `projects/app/` is the SPA.          |
| L1-09 / L2-24 / L2-46               | `src/web/projects/components/` hosts the Material-based design system.            |
| L1-07 / L2-19 / L2-20               | `src/api/Hubs/` and `src/web/.../core/realtime/` pair SignalR server and client.  |
| L1-08 / L2-21 / L2-22 / L2-33       | Responsive specs under `tests/e2e/specs/responsive/` run on mobile + desktop POMs. |
| L1-10 / L2-27 / L2-28               | `tests/e2e/support/a11y.ts` + `tests/e2e/specs/a11y/` enforce WCAG + SR.           |
| L1-11 / L2-29 / L2-30               | `tests/e2e/specs/performance/` runs Lighthouse / web-vitals probes.                |
| L1-12 / L2-32                       | `tests/e2e/pages/` is the sole location of selectors (POM).                        |
| L1-13 / L2-35 / L2-36               | File/test naming `L2-XX.<slug>` makes traceability mechanical.                    |
| L1-16 / L2-41                       | `src/api/Auth/TeamMembershipPolicy.cs` centralises team-data authorization.        |
| L1-18 / L2-47 / L2-48               | Section 8 exclusions + the fixed root layout defend simplicity.                    |
