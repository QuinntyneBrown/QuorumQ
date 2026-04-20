# QuorumQ — Task Index

Implementation tasks for the QuorumQ lunch-voting app. Each task is a narrowly
scoped **vertical slice** that can be picked up by a single coding agent,
implemented via ATDD (failing Playwright spec first — L2-35/L2-36), and
verified end-to-end.

## How to pick up a task

1. Open the task file, confirm all **Depends on** tasks are complete.
2. Read the L1/L2 spec lines referenced (`docs/specs/L1.md`, `docs/specs/L2.md`).
3. Read the design refs (`docs/designs/*.md`).
4. **Write the failing Playwright spec first** under
   `tests/e2e/specs/<area>/L2-XX.<slug>.spec.ts`. Test titles must start with
   `[L2-XX] ` (L2-36).
5. Implement with the smallest reasonable change (L2-47).
6. Follow `docs/folder-structure.md` for file placement. Do not introduce new
   top-level folders (L2-48).
7. Ensure tests pass on Chromium, Firefox, WebKit, and mobile Chrome (L2-33).

## Parallelization

Tasks declare their dependencies explicitly. Independent branches of the graph
may run in parallel. Below is the high-level dependency flow:

```
T-001 Root scaffold
  ├─ T-002 API skeleton ─┬─ T-010 entities ─ T-011 auth API ─┬─ T-012/13/14 auth FE
  │                      │                                     │
  │                      └─ T-014 authz policy ────────────────┤
  │                                                             ▼
  ├─ T-003 Angular workspace ─ T-005 tokens ─ T-006 components ─ T-007 shell ─…features…
  │                                                             │
  └─ T-004 Playwright skeleton ─ T-008 a11y / T-009 toasts ─────┘
```

## Tasks

### Foundation
- [T-001](T-001-root-scaffolding.md) — Root repository scaffolding
- [T-002](T-002-api-skeleton.md) — .NET API project skeleton
- [T-003](T-003-angular-workspace.md) — Angular workspace + components library skeleton
- [T-004](T-004-playwright-skeleton.md) — Playwright E2E skeleton
- [T-005](T-005-design-tokens-theme.md) — Design tokens & Material theming
- [T-006](T-006-components-primitives.md) — Components library primitives
- [T-007](T-007-app-shell.md) — App shell & responsive navigation (L2-21, L2-22)
- [T-008](T-008-a11y-foundation.md) — Accessibility foundation
- [T-009](T-009-notifications-infra.md) — Toast & live-region infrastructure

### Data & authentication
- [T-010](T-010-ef-entities.md) — EF Core entities + initial migration
- [T-011](T-011-auth-api.md) — Authentication API (L2-42)
- [T-012](T-012-sign-up.md) — Sign up with email (L2-04)
- [T-013](T-013-sign-in-out.md) — Sign in / sign out (L2-05)
- [T-014](T-014-session-persistence.md) — Session persistence (L2-06)
- [T-015](T-015-team-authz.md) — Team membership authorization policy (L2-41)

### Teams
- [T-016](T-016-create-team.md) — Create a team (L2-01)
- [T-017](T-017-invite-members.md) — Invite members (L2-02)
- [T-018](T-018-multiple-teams.md) — Multiple teams + switcher (L2-03)
- [T-019](T-019-team-dashboard.md) — Team dashboard + active session surface (L2-09)

### Sessions
- [T-020](T-020-start-session.md) — Start a lunch session (L2-07)
- [T-021](T-021-session-states.md) — Lunch session states (L2-08)
- [T-022](T-022-realtime.md) — SignalR hub + realtime client (L2-19)
- [T-023](T-023-presence.md) — Presence (L2-20)

### Suggestions
- [T-024](T-024-suggest-restaurant.md) — Suggest a restaurant (L2-10)
- [T-025](T-025-reuse-past.md) — Reuse past restaurants autocomplete (L2-11)
- [T-026](T-026-withdraw.md) — Withdraw own suggestion (L2-12)

### Voting
- [T-027](T-027-cast-vote.md) — Cast a vote (L2-13)
- [T-028](T-028-tie-breaking.md) — Tie breaking (L2-14)
- [T-029](T-029-winner-reveal.md) — Winner reveal (L2-15)

### Comments, reviews, restaurants
- [T-030](T-030-comments.md) — Comments on suggestions (L2-16)
- [T-031](T-031-reviews.md) — Review the winner (L2-17)
- [T-032](T-032-restaurant-profile.md) — Restaurant profile (L2-18)

### History
- [T-033](T-033-session-history.md) — Session history (L2-37)
- [T-034](T-034-export-csv.md) — Export history CSV (L2-38)

### Notifications
- [T-035](T-035-in-app-notifications.md) — In-app notifications (L2-39)
- [T-036](T-036-notification-preferences.md) — Notification preferences (L2-40)

### Settings & account
- [T-037](T-037-account-deletion.md) — Account deletion (L2-43)
- [T-038](T-038-settings-theme.md) — Settings screen + theme toggle (L2-26)

### Cross-cutting quality audits
- [T-039](T-039-touch-pointer-parity.md) — Touch / pointer / keyboard parity (L2-23)
- [T-040](T-040-design-system-audit.md) — Design system consistency audit (L2-24)
- [T-041](T-041-motion-reduced.md) — Motion & reduced motion (L2-25)
- [T-042](T-042-wcag-aa.md) — WCAG 2.1 AA audit (L2-27)
- [T-043](T-043-screen-reader.md) — Screen reader announcements audit (L2-28)
- [T-044](T-044-initial-load-perf.md) — Initial load performance (L2-29)
- [T-045](T-045-runtime-perf.md) — Runtime responsiveness (L2-30)
- [T-046](T-046-transport-storage.md) — Transport & storage security audit (L2-42)

## Conventions

- Task files are markdown, one per vertical slice.
- Spec file names follow `tests/e2e/specs/<area>/L2-XX.<slug>.spec.ts` as
  listed in `docs/folder-structure.md` §6.
- Test titles start with `[L2-XX] ` per L2-36.
- Selectors live only in `tests/e2e/pages/` (POM — L2-32).
- No new top-level folders, state-management libraries, or layering beyond
  what `docs/folder-structure.md` specifies (L2-47, L2-48).
