# 13 · Notifications

**Traces to:** L2-15, L2-19, L2-28, L2-39, L2-40

Three kinds of notifications in QuorumQ:

1. **Snackbar / Toast** — transient, in-viewport, for action confirmations
   and soft errors (`mat-snack-bar`).
2. **In-app event toast** — non-blocking, top-of-viewport on desktop /
   bottom on mobile, for session events a user isn't currently viewing
   (L2-39).
3. **Live-region announcement** — no visible UI; fires text into an ARIA
   live region for screen-reader users (L2-28).

---

## 1. Snackbar (action confirmations, soft errors)

Anatomy:

```
 ┌──────────────────────────────────────────────┐
 │  Message text                          ACTION│   bg inverse-surface
 └──────────────────────────────────────────────┘   radius-sm, elev-2
 width min(560, 100vw - 16); xs full-width minus 16 px gutters
 height auto (1–2 lines); pad space-4 horizontal, space-3 vertical
 enters from bottom 80 px above bottom-nav on xs; above content on md+
```

### 1.1 Variants

| Variant       | Bg token                         | Text token                       | Icon        |
|---------------|----------------------------------|----------------------------------|-------------|
| Default       | `inverse-surface`                | `inverse-on-surface`             | —           |
| Success       | `tertiary-container`             | `on-tertiary-container`          | ✓ tertiary  |
| Warning       | `tertiary-container` (muted)     | `on-tertiary-container`          | ⚠           |
| Error         | `error-container`                | `on-error-container`             | ⚠ error     |

### 1.2 Durations

| Content length                     | Duration (ms) |
|------------------------------------|---------------|
| Short (≤ 3 words)                  | 3000          |
| Standard                           | 4000          |
| With action                        | 6000          |
| With destructive undo              | 8000          |
| Critical (dismiss-only)            | 10000         |

### 1.3 Catalog

| Trigger                                   | Message                                | Action  |
|-------------------------------------------|----------------------------------------|---------|
| Team created (L2-01)                      | "Team Tacos created"                   | —       |
| Invite link copied (L2-02)                | "Invite link copied"                   | UNDO (regen) |
| Invites sent                              | "Invites sent to 2 people"             | UNDO    |
| Duplicate suggestion (L2-10 AC 2)         | "Already suggested by Jordan."         | UPVOTE  |
| Suggestion withdrawn                      | "Suggestion withdrawn"                 | UNDO    |
| Voting started (self-initiated)           | "Voting started"                       | —       |
| Vote failed                               | "Vote didn't go through."              | TRY AGAIN |
| Comment deleted                           | "Comment deleted"                      | UNDO    |
| Review saved (L2-17)                      | "Review saved"                         | —       |
| Theme changed                             | "Theme set to Dark"                    | —       |
| Notifications muted (L2-40)               | "Notifications paused for Engineering" | UNDO    |
| Export downloaded (L2-38)                 | "History exported"                     | OPEN    |
| Reconnect recovered (L2-19)               | "Back online"                          | —       |
| Rate limited (L2-05)                      | "Too many attempts. Try again soon."   | —       |
| Invite revoked                            | "Invite revoked"                       | —       |

---

## 2. In-app event toasts (L2-39)

Purpose: notify members of **session started**, **voting started**,
**5 min remaining**, **session decided** when they are *not* currently
viewing that session (L2-39 AC 1).

### 2.1 Anatomy

```
 ┌───────────────────────────────────────────────┐
 │ 🗳  Voting started in Team Tacos              │   title-medium
 │     Closes in 15 min.                  VIEW   │   body-small · action
 └───────────────────────────────────────────────┘   bg surface-container-high, elev-2
 radius-md, 72 px tall, pad space-4
```

- Desktop: top-right, stacked max 3.
- Mobile: bottom, above bottom-nav, single toast; newer replaces older.
- Duration: 6 s; `VIEW` action deep-links to the session.
- Dismissable with swipe (mobile) or ✕ (desktop).

### 2.2 Catalog

| Event                                     | Icon | Title                                   |
|-------------------------------------------|------|-----------------------------------------|
| Lunch started                              | 🍽   | "Lunch started in <team>"               |
| Voting started                             | 🗳   | "Voting started in <team>"              |
| 5 minutes remaining                        | ⏳   | "Voting closes in 5 minutes"            |
| Winner decided                             | 🏆   | "Winner: <restaurant>"                  |

### 2.3 Suppression rules (L2-39 AC 2, L2-40)

- Not shown if the user is already on the target session screen — replaced
  with an inline countdown or toast-less tally update.
- Not shown if the user has disabled that event in per-team preferences
  (L2-40).
- Not shown during OS-requested quiet hours when the user has opted in.

---

## 3. Live-region announcements (L2-28)

Hidden `<div>` pairs in the shell:

```html
<div id="live-polite"     class="sr-only" aria-live="polite"    aria-atomic="true"></div>
<div id="live-assertive"  class="sr-only" aria-live="assertive" aria-atomic="true"></div>
```

### 3.1 Polite catalog (unobtrusive)

| Trigger                              | Text                                          |
|--------------------------------------|-----------------------------------------------|
| New suggestion by another member     | "Jordan suggested Pho Forever."               |
| Vote tally updated                   | "Taco Town now has 5 votes, leading by 3."    |
| New comment                          | "New comment from Priya on Taco Town."        |
| Presence change                      | "Sam is online." (throttled; not every flip)  |
| Timer milestone every 5 min          | "10 minutes left to vote."                    |

### 3.2 Assertive catalog (interrupting)

| Trigger                              | Text                                          |
|--------------------------------------|-----------------------------------------------|
| Session decided (L2-15)              | "Winner: Taco Town, 5 votes, Mexican."        |
| Voting closes in ≤ 10 s              | "Voting closes in 5 seconds."                 |
| Critical error                       | "Something went wrong. Try again."            |
| Account deletion confirmed           | "Account deletion queued."                    |

### 3.3 Throttling

- Polite messages coalesce: the tally region re-announces at most once per
  2 s.
- Assertive messages never coalesce but are still rate-limited to one per
  500 ms.

---

## 4. Badge / dot indicators

For unread in-app notifications, a dot appears on the 🔔 top-app-bar icon:

```
 🔔 ·            1–9 unread: oval 16 px, primary bg, on-primary text
 🔔 9+           10+ unread: "9+" text
 🔔              no unread
```

Tapping opens a bottom-sheet (xs) / menu (md+) listing recent events:

```
┌───────────────────────────────────┐
│  Notifications                    │
├───────────────────────────────────┤
│  🏆  Taco Town won in Team Tacos  │
│       5 min ago         VIEW →    │
│  ─────────────────────────────    │
│  🗳  Voting started in Engineering│
│       12 min ago        VIEW →    │
│  ─────────────────────────────    │
│  🍽  Lunch started in Marketing   │
│       1 h ago           VIEW →    │
└───────────────────────────────────┘
 empty state: "All caught up 🎉"
```

A "Mark all as read" action is in the sheet header as an `mat-icon-button`.

---

## 5. Accessibility (notifications)

- Snackbars: `role="status"` (non-critical) or `role="alert"` (critical);
  Angular Material defaults map cleanly.
- Event toasts: `role="status"`, `aria-live="polite"`, non-interruptive.
- Winner reveal announcement goes through the **assertive** region in
  addition to the visible hero (L2-28 AC 2).
- Focus is not stolen by any notification — the user keeps typing without
  interruption.
- Actions inside snackbars have `aria-label` where the visible label would
  be ambiguous (e.g. the UNDO button includes context:
  `aria-label="Undo delete comment"`).
