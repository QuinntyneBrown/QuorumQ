# QuorumQ

[![CI](https://github.com/QuinntyneBrown/QuorumQ/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/QuinntyneBrown/QuorumQ/actions/workflows/ci.yml)
[![E2E](https://github.com/QuinntyneBrown/QuorumQ/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/QuinntyneBrown/QuorumQ/actions/workflows/e2e.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031)](https://angular.dev/)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-45BA4B)](https://playwright.dev/)

QuorumQ is a real-time lunch decision app for teams. It helps coworkers create teams, start lunch sessions, suggest restaurants, vote live, review winners, and keep a history of what the group chose.

ASP.NET Core · Angular · Angular Material · SignalR · Playwright
**[Documentation](#documentation)** · **[Quick Start](#quick-start)** · **[Architecture](#architecture)** · **[Contributing](CONTRIBUTING.md)** · **[Security](SECURITY.md)** · **[License](LICENSE)**

## Why QuorumQ

Lunch decisions usually devolve into side chats, duplicated suggestions, and unclear outcomes. QuorumQ gives teams a single shared flow for that decision:

- Create or join teams.
- Start a lunch session with a deadline.
- Suggest restaurants and vote in real time.
- Break ties transparently and announce a winner.
- Capture reviews, notifications, and session history.

The repository is structured around radical simplicity: one .NET API, one Angular workspace, one Playwright suite, and requirements that stay traceable from spec to test to implementation.

## Highlights

- Team membership with invite links and multi-team switching.
- Email/password authentication with persisted sessions and team-scoped authorization.
- Lunch session lifecycle covering suggesting, voting, tie-breaking, decision, and cancellation.
- Real-time updates for suggestions, votes, comments, presence, and notifications through SignalR.
- Mobile-first Angular Material UI with light and dark themes.
- Restaurant profiles, post-session reviews, history screens, and CSV export.
- Acceptance Test Driven Development with Playwright Page Objects and L2 requirement traceability.

## Architecture

```text
src/web (Angular 21 workspace)
├── projects/app         # QuorumQ SPA
└── projects/components  # shared design system / component library

src/api (ASP.NET Core .NET 9)
├── minimal API endpoints
├── SignalR hubs
├── EF Core + SQLite
└── OpenAPI / Swagger in Development

tests/
├── api                  # xUnit API tests
└── e2e                  # Playwright acceptance suite
```

Key implementation choices:

- The backend is a single ASP.NET Core Web API project with EF Core and SQLite.
- The frontend is a single Angular CLI workspace with an application project and a reusable components library.
- Real-time collaboration and in-app notifications are implemented with SignalR hubs.
- Product behavior is defined in `docs/specs/L1.md` and `docs/specs/L2.md`, then verified through Playwright.

## Quick Start

### Prerequisites

- .NET SDK `9.0.308` or later in the .NET 9 line
- Node.js `22`
- npm `10+`

### Install dependencies

```bash
npm install
npm install --prefix src/web
npm install --prefix tests/e2e
dotnet restore QuorumQ.sln
```

### Run locally

Start the API:

```bash
dotnet watch run --project src/api/Api.csproj
```

Start the web app in a second terminal:

```bash
npm run dev --prefix src/web
```

Then open:

- Web app: `http://localhost:4200`
- API Swagger UI: `http://localhost:5052/swagger`
- Health endpoint: `http://localhost:5052/health`

In Development, the API applies migrations and seeds local data automatically.

## Build And Test

```bash
dotnet build src/api/Api.csproj
dotnet test tests/api/QuorumQ.Api.Tests.csproj
npm run build --prefix src/web
npm run lint --prefix src/web
npm run test:e2e
```

Useful optional commands:

```bash
npm run generate:api --prefix src/web
npm run analyze --prefix src/web
npm run report --prefix tests/e2e
```

## Repository Layout

```text
QuorumQ/
├── docs/       # product specs and repository guidance
├── src/api/    # ASP.NET Core API, EF Core, SignalR
├── src/web/    # Angular workspace (app + components library)
├── tests/api/  # xUnit tests
└── tests/e2e/  # Playwright acceptance tests
```

For the detailed structure and layout rules, see [docs/folder-structure.md](docs/folder-structure.md).

## Documentation

- [docs/index.md](docs/index.md): docs entry point
- [docs/user-guide/index.md](docs/user-guide/index.md): end-user guide
- [docs/specs/L1.md](docs/specs/L1.md): high-level product requirements
- [docs/specs/L2.md](docs/specs/L2.md): detailed requirements and acceptance criteria
- [docs/folder-structure.md](docs/folder-structure.md): repository architecture and conventions
- [tests/e2e/playwright/traceability.md](tests/e2e/playwright/traceability.md): generated L2-to-test traceability output

## Contributing

Contributions are welcome, but this repository expects changes to stay aligned with the documented requirements and the repository layout rules. Start with [CONTRIBUTING.md](CONTRIBUTING.md) for setup, workflow, and pull request expectations.

## Security

If you discover a vulnerability, please do not open a public issue. Follow the guidance in [SECURITY.md](SECURITY.md).

## Code Of Conduct

This project follows the standards in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](LICENSE).
