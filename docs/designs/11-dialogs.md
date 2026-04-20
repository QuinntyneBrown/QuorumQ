# 11 · Dialogs & Sheets

**Traces to:** L2-24, L2-46

Dialogs and bottom-sheets use `mat-dialog` / `mat-bottom-sheet`. The app
follows a **sheet-on-mobile, dialog-on-desktop** rule: any confirmation or
form that would be a centered dialog at `md+` renders as a bottom-sheet at
`xs/sm` — because sheets are thumb-reachable and don't force the virtual
keyboard to overlap a centered dialog.

General rules:

| Attribute        | Dialog (md+)                | Bottom-sheet (xs/sm)          |
|------------------|-----------------------------|-------------------------------|
| Width            | min(560, 100vw - 32)        | 100 vw                        |
| Max height       | 90 vh                       | 90 vh                         |
| Radius           | `radius-lg` (16)            | `radius-xl` top only (24)     |
| Elevation        | `elev-3`                    | `elev-2`                      |
| Scrim            | `scrim` @ 32 %              | `scrim` @ 32 %                |
| Close affordance | `mat-icon-button` (✕) or backdrop click | drag handle + swipe-down |
| Focus on open    | First tab-stop              | First tab-stop                |
| Restore focus on close | Yes                   | Yes                           |
| Esc to close     | Yes                         | Yes                           |

All dialog actions follow the pattern **[neutral] [destructive/primary]** at
the trailing edge. Actions use `label-large` typography.

---

## 1. Confirm — Start voting (L2-08 AC 1)

```
┌─────────────────────────────────────────────┐
│  Start voting?                              │   title-large
│  ───────────────────                        │
│  New suggestions will be locked and         │   body-medium
│  members can start casting votes.           │
│                                             │
│                     Cancel     Start voting │   text + filled
└─────────────────────────────────────────────┘
```

---

## 2. Destructive — Withdraw suggestion (L2-12)

```
┌─────────────────────────────────────────────┐
│  Withdraw this suggestion?                  │
│  ───────────────────                        │
│  Taco Town will be removed for everyone.    │
│  You can suggest it again while this lunch  │
│  is still in "Suggesting".                  │
│                                             │
│                     Cancel       Withdraw   │   text + filled (error color)
└─────────────────────────────────────────────┘
```

---

## 3. Destructive — Remove member

```
┌─────────────────────────────────────────────┐
│  Remove Sam Kim from Team Tacos?            │
│  ───────────────────                        │
│  Their past votes and comments stay, but    │
│  they will no longer see this team.         │
│                                             │
│                     Cancel        Remove    │   filled error
└─────────────────────────────────────────────┘
```

---

## 4. Destructive — Cancel lunch (L2-08 AC 3)

```
┌─────────────────────────────────────────────┐
│  Cancel today's lunch?                      │
│  ───────────────────                        │
│  The session will become read-only for the  │
│  whole team. This can't be undone.          │
│                                             │
│                  Keep going    Cancel lunch │   text + filled error
└─────────────────────────────────────────────┘
```

---

## 5. Info — Winner chosen at random (L2-14 AC 3)

```
┌─────────────────────────────────────────────┐
│  🎲  Winner chosen at random                │
│  ───────────────────                        │
│  The tie-breaker also ended tied, so we     │
│  picked a winner for you.                   │
│                                             │
│                                      OK     │   filled
└─────────────────────────────────────────────┘
```

---

## 6. Form — Create team on md+ (L2-01)

```
┌─────────────────────────────────────────────┐
│  New team                                   │
│  ───────────────────                        │
│  Team name                                  │
│  ┌───────────────────────────────────────┐  │
│  │ Team Tacos                            │  │
│  └───────────────────────────────────────┘  │
│  3–50 characters                            │
│                                             │
│  Description (optional)                     │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│                       Cancel    Create team │
└─────────────────────────────────────────────┘
```

(Bottom-sheet variant for xs is the full-screen form from `06-screens-team.md §2`.)

---

## 7. Form — Start lunch (L2-07)

Dialog equivalent of the mobile bottom sheet in `07-screens-session.md §1`.
Desktop inlines the slider + checkbox in the same layout.

---

## 8. Form — Invite via email

```
┌─────────────────────────────────────────────┐
│  Invite to Team Tacos                       │
│  ───────────────────                        │
│  Email addresses (comma-separated)          │
│  ┌───────────────────────────────────────┐  │
│  │ alex@team.com, sam@team.com           │  │
│  └───────────────────────────────────────┘  │
│                                             │
│                         Cancel       Send   │
└─────────────────────────────────────────────┘
```

Snackbar on success: "Invites sent to 2 people" with an `UNDO` action that
revokes the just-sent invites within 10 s.

---

## 9. Info — Verify your email (L2-04 AC 2)

See `05-screens-auth.md §4` — dialog variant.

---

## 10. Info — Session expired (L2-06)

See `05-screens-auth.md §6`.

---

## 11. Info — Duplicate suggestion (L2-10 AC 2)

Uses a snackbar (see `13-notifications.md §2`) rather than a dialog, to
preserve flow.

---

## 12. Destructive — Delete account (L2-43)

Two-step dialog; see `10-screens-settings.md §5`.

---

## 13. Form — Export history (L2-38)

See `09-screens-history.md §4`.

---

## 14. Bottom sheet — Suggest a restaurant (L2-10)

Full-screen sheet on xs (see `07-screens-session.md §2.1`); on md+ it becomes
a centered dialog at 560 × auto.

---

## 15. Bottom sheet — Comments thread (L2-16)

Mobile-only; on md+ the thread is a right-column panel instead.

---

## 16. Bottom sheet — Presence list (L2-20)

See `07-screens-session.md §8`.

---

## 17. Bottom sheet — Team switcher (L2-03)

See `04-layout-navigation.md §4`.

---

## 18. Full-screen overlay — Winner reveal (L2-15)

Not technically `mat-dialog`; a CDK overlay with `hasBackdrop: true`, panel
class `qq-reveal-panel`. Trap focus within, return to the triggering element
on close. See `07-screens-session.md §5` and `14-motion.md §5` for
choreography.

---

## 19. Accessibility contract (every dialog)

- `role="dialog"` (or `alertdialog` for destructive confirms).
- `aria-labelledby` points to the title; `aria-describedby` points to the
  body text.
- Focus is trapped within the dialog; Tab cycles.
- First focused element: the first text input, or, if none, the neutral
  close action.
- Esc closes (unless the dialog is `[disableClose]` — only the session-
  expired dialog).
- The element that opened the dialog regains focus on close.
- Announce title via `aria-live="polite"` (alert dialogs: "assertive").
