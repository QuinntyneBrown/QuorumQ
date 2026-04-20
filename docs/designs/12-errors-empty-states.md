# 12 · Errors & Empty States

**Traces to:** L2-04, L2-05, L2-10, L2-19, L2-27, L2-28, L2-41

Design for the path where things go wrong. Every error state answers three
questions: *What happened? · Why? · What can I do?*

Error tone is direct and warm, never blaming the user. One sentence + one
action whenever possible.

---

## 1. Inline field validation

Pattern: message beneath the field, `error` color, 12 px from baseline.
`aria-invalid=true`, `aria-describedby` → message id.

```
  Email
 ┌───────────────────────────────────┐
 │ priya                             │     error border
 └───────────────────────────────────┘
  Enter a valid email address.             body-small, error color
```

Validation copy bank:

| Situation                           | Message |
|-------------------------------------|---------|
| Empty required field                | "Required." |
| Invalid email                       | "Enter a valid email address." |
| Password too short                  | "At least 8 characters." |
| Password rules unmet                | "Add a number and a symbol." |
| Team name < 3                       | "Team name must be at least 3 characters." |
| Team name > 50                      | "Team name must be 50 characters or fewer." |
| Suggestion name < 2                 | "Give it at least 2 characters." |
| Suggestion name > 80                | "Keep it under 80 characters." |
| Comment > 500                       | "Comments are 500 characters max." |
| Review rating missing               | "Pick a rating first." |
| Voting deadline out of range        | "Pick between 5 and 180 minutes." |
| Invite email list invalid           | "One of these emails looks off." |

---

## 2. Page-level error banners

Banner = a strip above the main content (inside scroll container) with a
leading icon, body text, and a trailing action.

### 2.1 Verify email (L2-04 AC 2) — tertiary banner

```
 ┌───────────────────────────────────────────────┐
 │  ✉  Verify your email    Resend · I've done it│
 │                                               │   tertiary-container bg
 └───────────────────────────────────────────────┘   on-tertiary-container text
```

### 2.2 Reconnecting (L2-19 AC 2) — neutral banner

```
 ┌───────────────────────────────────────────────┐
 │  ⟳  Reconnecting…                             │   surface-container-highest
 └───────────────────────────────────────────────┘   on-surface-variant
```

Implementation: polite live-region, shown after 3 s of lost connection,
hidden on reconnect (fade 200 ms). No dismiss; the app retries in the
background.

### 2.3 Offline — error banner

```
 ┌───────────────────────────────────────────────┐
 │  ⚠  You're offline                            │   error-container
 │  Your next actions will retry once you're     │   body-small
 │  back online.                 Retry now       │
 └───────────────────────────────────────────────┘
```

### 2.4 Rate-limited sign-in (L2-05 AC 3)

See `05-screens-auth.md §2`.

---

## 3. Full-page errors

### 3.1 403 / No team access (L2-41)

```
┌───────────────────────────────────┐
│                                   │
│              🔒                    │
│                                   │
│   You don't have access           │   headline-small
│   Ask the team owner for an       │   body-medium (muted)
│   invite.                         │
│                                   │
│  ┌───────────────────────────────┐│
│  │     Go to your teams          ││   filled primary
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

### 3.2 404 — Not found

```
┌───────────────────────────────────┐
│                                   │
│              🍽                    │   icon-hero, outline color
│                                   │
│   Nothing here                    │   headline-small
│   This page seems to have been    │   body-medium (muted)
│   eaten.                          │
│                                   │
│  ┌───────────────────────────────┐│
│  │          Back home            ││
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

### 3.3 500 / Server error

```
┌───────────────────────────────────┐
│                                   │
│              ⚠                    │   icon-hero, error
│                                   │
│   Something went wrong            │   headline-small
│   We've been notified. Try again  │   body-medium (muted)
│   in a moment.                    │
│                                   │
│  ┌───────────────────────────────┐│
│  │            Retry              ││
│  └───────────────────────────────┘│
│                                   │
│   Error ID: e5f2-a14b             │   body-small (muted, selectable)
└───────────────────────────────────┘
```

The error ID is included so users can reference it in support.

### 3.4 Maintenance mode

```
┌───────────────────────────────────┐
│                                   │
│              🛠                    │
│                                   │
│   We're making lunch better       │
│   Back shortly. Check back in     │
│   a minute.                       │
└───────────────────────────────────┘
```

Auto-retry every 30 s; reveal button after 2 attempts.

---

## 4. Empty states

Every empty state has: **illustration · heading · description · primary
action**. Heading is `headline-small`, description is `body-medium` on
`on-surface-variant`, primary action is the recommended next step.

### 4.1 No teams (L2-03 AC 2)
See `06-screens-team.md §6`.

### 4.2 No active lunch today
See `06-screens-team.md §1`.

### 4.3 No suggestions yet
```
┌───────────────────────────────────┐
│                                   │
│           ✎                        │   icon-hero, secondary
│                                   │
│   No suggestions yet              │
│   Be the first to pitch a spot.   │
│                                   │
│  ┌───────────────────────────────┐│
│  │     Suggest a restaurant      ││
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

### 4.4 No votes yet (Voting state, before any vote)
```
┌───────────────────────────────────┐
│                                   │
│           🗳                        │
│                                   │
│   Cast the first vote             │
│   Pick your favorite from the     │
│   suggestions below.              │
└───────────────────────────────────┘
```

### 4.5 No history
See `09-screens-history.md §1`.

### 4.6 No reviews
See `08-screens-restaurant.md §2`.

### 4.7 Offline cache empty
```
┌───────────────────────────────────┐
│           📶                        │
│   You're offline                   │
│   Connect to load this team.       │
│                                   │
│  ┌───────────────────────────────┐│
│  │          Retry                ││
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

---

## 5. Connectivity — real-time reconnect (L2-19 AC 2)

States shown as a compact banner fixed below the app bar:

```
 connected         hidden (no banner)

 connecting        ┌─────────────────────────────────┐
                   │ ⟳  Connecting…                  │
                   └─────────────────────────────────┘
                   on-surface-variant, 200 ms fade in after 3 s

 reconnecting      ┌─────────────────────────────────┐
                   │ ⟳  Reconnecting…                │
                   └─────────────────────────────────┘

 reconnected       snackbar: "Back online" (2 s, tertiary-container)

 stuck (> 30 s)    ┌─────────────────────────────────┐
                   │ ⚠  Still offline.    Retry now  │   error-container
                   └─────────────────────────────────┘
```

While reconnecting, optimistic updates remain visible but marked pending:

```
 ┌─────────────────────────────┐
 │ 🌮 Taco Town         (syncing)│   body-small (muted) on right
 └─────────────────────────────┘
```

---

## 6. Action-level errors

### 6.1 Duplicate suggestion (L2-10 AC 2)

Snackbar variant with a primary action:

```
 ┌──────────────────────────────────────────────┐
 │  Already suggested by Jordan.      UPVOTE    │
 └──────────────────────────────────────────────┘
 bg inverse-surface; action primary
```

### 6.2 Vote failed

```
 ┌──────────────────────────────────────────────┐
 │  Vote didn't go through.         TRY AGAIN   │
 └──────────────────────────────────────────────┘
```

### 6.3 Comment failed (optimistic UI rollback)

Comment rendered with a subtle `error` border and a small re-send icon
button on the row:
```
 👤 Priya · now
 I love their horchata.          ⚠ retry
```

---

## 7. Destructive toast (undo)

For reversible destructive actions — withdraw, delete comment, revoke invite.

```
 ┌──────────────────────────────────────────────┐
 │  Comment deleted                    UNDO     │
 └──────────────────────────────────────────────┘
 8 s duration, polite live-region
```

---

## 8. A11y specifics

- Critical errors (403, 500, maintenance) use `role="alert"` +
  `aria-live="assertive"`.
- Inline field errors use `aria-invalid` + `aria-describedby`; the container
  form uses `aria-live="polite"` only for summary errors.
- Every empty state illustration has `role="img"` with a descriptive
  `aria-label`, or is decorative (`aria-hidden="true"`) when a text heading
  already describes the state.
- Snackbar announcements are polite; the winner reveal (not an error) uses
  assertive.
