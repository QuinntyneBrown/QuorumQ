# T-029 — Winner reveal

**Traces to:** L1-05, L1-09, L1-15 / L2-15
**Depends on:** T-028, T-009
**Primary area:** full stack (frontend-heavy)
**Design refs:** `docs/designs/07-screens-session.md`, `docs/designs/14-motion.md`
**Folder structure:** `docs/folder-structure.md` §5.1 (`features/sessions/winner-reveal.page.ts`)
**Status:** Open

## Goal

When a session transitions to `Decided`, every member sees a spectacular
full-screen animated reveal of the winning restaurant within 2 seconds.
Primary actions "Get directions" and "Open website" are on the reveal.

## Scope

### Backend
- Already returns winner in session detail (T-020–T-028). Add link
  helpers in the response: `directionsUrl` (maps query from address) and
  `websiteUrl`.

### Frontend — `features/sessions/winner-reveal.page.ts`
- Full-screen overlay route `/teams/:id/sessions/:sessionId/winner`.
- Uses `@components/winner-reveal` (T-006) — composition:
  - Confetti-like motion token animation (respects reduced motion).
  - Restaurant name, cuisine, and "Chosen at random" chip when
    applicable (T-028).
  - Primary Material buttons: "Get directions" (opens directions URL in
    new tab) and "Open website" (disabled when no website URL).
- On hub `Decided` event, the session page auto-navigates to the
  reveal route.
- `NotificationService.show({ kind: 'success', message: 'Winner decided',
  deepLink })` fires for members not currently on the session screen
  (feeds into T-035).

### Accessibility
- On reveal, call `LiveAnnouncer.assertive('Winner: <name>')` (L2-28).
- Reveal route has `role="dialog"` and focus is trapped to the primary
  buttons.

### E2E — `tests/e2e/pages/sessions/winner-reveal.page.ts`
- `expectWinnerRevealWithin(ms)`, `expectDirectionsLink()`,
  `expectWebsiteLink()`, `expectRandomChoiceChip()`.

## ATDD — Failing tests first (L2-35)

- `tests/e2e/specs/voting/L2-15.announce-winner.spec.ts`:
  - `[L2-15] all members see the animated winner reveal within 2 seconds of transition to Decided`
  - `[L2-15] reveal shows "Get directions" and "Open website" actions when available`
  - `[L2-15] winner chosen at random displays the random-choice chip`

## Folder-structure pointers

- `src/web/projects/app/src/app/features/sessions/winner-reveal.page.ts`
- `src/web/projects/components/src/lib/winner-reveal/` (T-006)
- `tests/e2e/specs/voting/L2-15.announce-winner.spec.ts`

## Definition of Done

- [ ] Failing spec first; passes on all browsers.
- [ ] Reveal appears within 2 s across two contexts.
- [ ] Reveal honours `prefers-reduced-motion` (T-041 regression guard).
- [ ] Screen-reader assertive announcement fires on reveal (L2-28).
- [ ] "Get directions" uses a generic maps URL (no 3rd-party SDK).
