# QuorumQ

A real-time lunch-decision app for teams. Members suggest restaurants, vote on them, and the winning pick is revealed in a live session.

## Getting started

```bash
npm run dev        # start API + Angular app concurrently
npm run build      # build both
npm run test:e2e   # run Playwright E2E suite
```

## Documentation

- **Requirements:** [`docs/specs/L1.md`](docs/specs/L1.md) · [`docs/specs/L2.md`](docs/specs/L2.md)
- **Folder layout:** [`docs/folder-structure.md`](docs/folder-structure.md)

## Structure

```
QuorumQ/
├── src/api/    ASP.NET Core Web API
├── src/web/    Angular workspace (app + components library)
├── tests/e2e/  Playwright suite (Page Object Model)
└── docs/       Specs, folder structure, design docs
```
