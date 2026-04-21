# Contributing To QuorumQ

QuorumQ is developed with a strict bias toward clarity, traceability, and small change sets. Contributions are welcome, but they should fit the repository's documented requirements and architecture.

## Before You Start

- Review [README.md](README.md), [docs/specs/L1.md](docs/specs/L1.md), and [docs/specs/L2.md](docs/specs/L2.md).
- Review [docs/folder-structure.md](docs/folder-structure.md) before adding files or changing project layout.
- Open an issue or start a discussion before large or cross-cutting changes.

## Local Setup

Prerequisites:

- .NET SDK `9.0.308` or later in the .NET 9 line
- Node.js `22`
- npm `10+`

Install dependencies:

```bash
npm install
npm install --prefix src/web
npm install --prefix tests/e2e
dotnet restore QuorumQ.sln
```

Run locally:

```bash
dotnet watch run --project src/api/Api.csproj
npm run dev --prefix src/web
```

## Development Workflow

### 1. Start From The Requirement

- Link your change to the relevant `L2-XX` requirement in [docs/specs/L2.md](docs/specs/L2.md).
- If the change adds user-visible behavior, update the spec first when needed.

### 2. Follow ATDD

- Add or update the Playwright acceptance test first.
- Keep Playwright selectors inside `tests/e2e/pages/` Page Objects only.
- Ensure test titles include the matching `[L2-XX]` tag.

### 3. Preserve Simplicity

- Keep the backend in the existing single-project minimal API style.
- Do not introduce extra architectural layers, top-level folders, or speculative abstractions.
- Keep the Angular app within the current Angular workspace and Angular Material design system.

### 4. Run Validation Before Opening A PR

```bash
dotnet test tests/api/QuorumQ.Api.Tests.csproj
npm run build --prefix src/web
npm run lint --prefix src/web
npm run test:e2e
```

## Pull Request Expectations

- Keep PRs focused and explain which `L2-XX` requirements are being addressed.
- Include screenshots or short recordings for meaningful UI changes.
- Update docs when behavior, commands, or project structure changes.
- Avoid unrelated cleanup in feature PRs unless it is required for the change.

## Review Checklist

- Requirements traced
- Tests added or updated
- Docs updated
- No unnecessary layers or dependencies introduced
- Commands and examples verified
