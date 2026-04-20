# T-043 — Screen reader announcements audit

**Traces to:** L1-10 / L2-28
**Depends on:** T-008, T-027, T-029, T-021
**Primary area:** frontend + e2e
**Design refs:** `docs/designs/15-accessibility.md`, `docs/designs/13-notifications.md`
**Folder structure:** `docs/folder-structure.md` §6 (`specs/a11y/L2-28...`)

## Goal

Dynamic changes (new vote counts, new comments, state transitions, winner
decisions) are announced to assistive technology. Polite live regions for
routine updates; assertive for winner announcement.

## Scope

### Implementation polish
- `LiveAnnouncer` (T-008) calls wired into:
  - Vote cast → polite: "You voted for <name>. Current tally: N."
  - Vote count change on a suggestion the user previously voted for →
    polite (throttled).
  - New comment on the thread the user has focused → polite.
  - State transition → polite.
  - Winner decided → assertive.

### E2E
- `expectLiveRegionAnnouncement(page, text)` (T-008) used to verify each
  case.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/a11y/L2-28.screen-reader.spec.ts`:
  - `[L2-28] casting a vote produces a polite live-region announcement with the updated tally`
  - `[L2-28] session transitioning to Decided produces an assertive live-region announcement of the winner`
  - `[L2-28] new comments appear as polite announcements (throttled)`

## Folder-structure pointers

- `src/web/projects/app/src/app/core/a11y/live-announcer.ts`
- `src/web/projects/app/src/app/features/voting/vote-button.component.ts`
- `src/web/projects/app/src/app/features/sessions/winner-reveal.page.ts`
- `tests/e2e/specs/a11y/L2-28.screen-reader.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Only one assertive announcement per decided transition.
- [ ] Polite announcements throttled (no flooding on high-activity
      sessions).
- [ ] Zero redundant announcements (e.g., toast + live region for the
      same thing uses T-009's single mirrored call).
