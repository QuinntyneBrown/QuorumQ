# T-038 — Settings screen + theme toggle

**Traces to:** L1-09, L1-10 / L2-26
**Depends on:** T-007, T-005, T-014
**Primary area:** full stack (frontend-heavy)
**Design refs:** `docs/designs/10-screens-settings.md`, `docs/designs/02-theming.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/settings/`), `core/theme/`

## Goal

Ship the Settings screen as the shell for account, notification, and theme
settings. The theme toggle applies dark or light immediately, respects the
OS preference by default, and persists the user's override server-side
across devices.

## Scope

### Backend
- Extend `GET /auth/me` response with `preferences: { theme: 'system' |
  'light' | 'dark' }`.
- `PUT /auth/me/preferences` — body `{ theme }`. Persists on
  `User.Preferences` (simple JSON column, inline mapping — no new
  abstraction).

### Frontend
- `features/settings/settings.page.ts`:
  - Material `mat-tab-group` with tabs: Account, Notifications
    (T-036 plugs in), Theme.
  - Delete account section (T-037 plugs in) lives on the Account tab.
- `core/theme/theme.service.ts`:
  - Signal `theme: 'system' | 'light' | 'dark'` hydrated from
    `auth/me`.
  - Applies `<html data-theme='light|dark'>` where dark/light resolves
    from the signal and `prefers-color-scheme` for `system`.
  - Syncs to `PUT /auth/me/preferences` on change.
- `features/settings/theme.page.ts` — Material `matButtonToggleGroup`
  with three options; shows current OS preference.

### Rules
- Theme switching happens without a reload.
- No global CSS variables beyond the tokens emitted in T-005.
- Per `docs/designs/02-theming.md`, both palettes are precomputed in
  `_theme.scss`; the toggle only swaps the `data-theme` attribute.

### E2E
- `tests/e2e/pages/` — add `settings.page.ts` with `openTab(name)`,
  `selectTheme(choice)`, `expectTheme(resolved)`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/design-system/L2-26.themes.spec.ts`:
  - `[L2-26] new user with OS dark mode opens the app in dark mode`
  - `[L2-26] toggling theme persists across sessions and devices`

Use Playwright `colorScheme: 'dark'` context option to simulate the OS
preference.

## Folder-structure pointers

- `src/web/projects/app/src/app/features/settings/settings.page.ts`
- `src/web/projects/app/src/app/features/settings/theme.page.ts`
- `src/web/projects/app/src/app/core/theme/theme.service.ts`
- `tests/e2e/specs/design-system/L2-26.themes.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Theme change applies without a reload; animations honour reduced
      motion.
- [ ] Preference syncs via API and survives `localStorage.clear()` +
      reload on another device.
- [ ] Settings page composed only of Material + `@components/*`.
