# T-001 — Root repository scaffolding

**Traces to:** L1-17, L1-18 / L2-47, L2-48
**Depends on:** none
**Primary area:** infra
**Design refs:** —
**Folder structure:** `docs/folder-structure.md` §2
**Status:** Assigned

## Goal

Create the flat top-level layout that every other task builds on. No product
code yet — just the scaffolding and tooling that enforces the "one obvious
place for each thing" rule.

## Scope

### Repo root
- `.editorconfig`, `.gitattributes`, `.gitignore` (covers `bin/`, `obj/`,
  `node_modules/`, `dist/`, `*.log`, Playwright artifacts, generated OpenAPI).
- `global.json` pinning the .NET SDK (current LTS).
- `QuorumQ.sln` — empty solution file; projects are added by T-002.
- Root `package.json` with umbrella scripts only:
  - `dev` — starts API and Angular app concurrently.
  - `build` — builds both.
  - `test:e2e` — runs Playwright against a built API + web.
  - Declares **no application dependencies**.
- `README.md` — one-screen overview pointing at `docs/specs` and
  `docs/folder-structure.md`.
- `.github/workflows/ci.yml` — build + unit tests + lint (stubs ok; fleshed
  out per task).
- `.github/workflows/e2e.yml` — Playwright against built API + web (stub ok).

### Directories created (empty except `.gitkeep`)
- `src/api/`, `src/web/`
- `tests/e2e/`

## ATDD — Failing tests first (L2-35)

No feature tests in this task. The scaffolding is verified by smoke tests in
subsequent skeleton tasks (T-002, T-003, T-004).

## Definition of Done

- [ ] Repo root matches `docs/folder-structure.md` §2 exactly.
- [ ] `npm run` shows only the three umbrella scripts (`dev`, `build`,
      `test:e2e`).
- [ ] No dependency declared at the root `package.json`.
- [ ] CI workflow files exist and parse (stubs allowed).
- [ ] No new top-level folder beyond `src/`, `tests/`, `docs/`, `.github/`
      (L2-48).

