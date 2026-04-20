# T-034 — Export history as CSV

**Traces to:** L1-14 / L2-38
**Depends on:** T-033
**Primary area:** full stack
**Design refs:** `docs/designs/09-screens-history.md`
**Folder structure:** `docs/folder-structure.md` §4 (`Endpoints/HistoryEndpoints.cs`)

## Goal

A team Owner downloads the team's session history as a CSV including date,
winner, tally, and participants.

## Scope

### Backend
- `GET /teams/:id/history/export.csv` — Owner-only (via T-015 role
  check). Streams CSV with columns: `date,winner,cuisine,tally,participants`.
  Uses `System.IO.StreamWriter` inline; no CSV library (L2-47).

### Frontend
- On `session-history.page.ts`, an "Export CSV" action visible to Owners
  only. Clicking it calls a helper that fetches the CSV and saves via a
  hidden `<a download>` (no third-party file-saver).

### E2E — `tests/e2e/pages/sessions/session-history.page.ts`
- Add `tapExportCsv()`, `expectDownloadMatches(schema)`.
- Use Playwright `page.waitForEvent('download')`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/history/L2-38.export-csv.spec.ts`:
  - `[L2-38] Owner taps Export CSV and downloads a file containing date, winner, tally, participants`
  - `[L2-38] Non-owner does not see Export CSV`

## Folder-structure pointers

- `src/api/Endpoints/HistoryEndpoints.cs` (extended)
- `src/web/projects/app/src/app/features/history/session-history.page.ts` (extended)
- `tests/e2e/specs/history/L2-38.export-csv.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] CSV includes all specified columns and escapes commas/quotes
      correctly.
- [ ] Non-owner export request returns 403 (T-015) and the button is
      hidden in the UI.
- [ ] No third-party CSV library introduced (L2-47).
