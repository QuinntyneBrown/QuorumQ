# 06 · Team Screens

**Traces to:** L2-01, L2-02, L2-03, L2-09

---

## 1. Team dashboard (home)

Mobile, `xs` — no active session:

```
┌───────────────────────────────────┐
│  ☰  Team Tacos             🔔  👤 │   top app bar
├───────────────────────────────────┤
│                                   │
│  Hi Priya 👋                      │   headline-small (display family)
│  What's for lunch today?          │   body-large, on-surface-variant
│                                   │   space-6
│                                   │
│  ┌─────────────────────────────┐  │
│  │            🍽                │  │   empty-state card,
│  │  No lunch today yet.        │  │   pad space-10 vertical
│  │  Get things rolling.        │  │
│  │                             │  │
│  │   ┌─────────────────────┐   │  │
│  │   │   Start lunch       │   │  │   filled primary
│  │   └─────────────────────┘   │  │
│  └─────────────────────────────┘  │
│                                   │
│  Recent winners                   │   title-medium
│  ┌─────────────────────────────┐  │
│  │ 🏆 Taco Town · Yesterday    │  │   list item
│  │ 🏆 Pho Forever · Monday     │  │
│  │ 🏆 Green Bowl · Friday      │  │
│  └─────────────────────────────┘  │
│                                   │
├───────────────────────────────────┤
│  🏠   🍽   🕓   👥                │   bottom nav
└───────────────────────────────────┘
```

Mobile, `xs` — with active session (L2-09):

```
┌───────────────────────────────────┐
│  ☰  Team Tacos             🔔  👤 │
├───────────────────────────────────┤
│                                   │
│  ┌─────────────────────────────┐  │  ★ session hero card, full-width
│  │ 🍽  Lunch · Today            │  │  above fold (L2-09 AC 1)
│  │                              │  │
│  │ [ Voting ]    12 : 34        │  │  chip + countdown
│  │ ███████████░░░░░░░░  65 %    │  │  progress
│  │                              │  │
│  │ 👤 👤 👤 +4 online            │  │  presence stack
│  │ 8 members voted · 3 pending  │  │
│  │                              │  │
│  │ ┌─────────────┐ ┌──────────┐ │  │
│  │ │  Open       │ │  Invite  │ │  │
│  │ └─────────────┘ └──────────┘ │  │
│  └─────────────────────────────┘  │
│                                   │
│  Previous winners                 │
│  ...                              │
└───────────────────────────────────┘
```

Tablet+, `md`:

```
┌──────────────────────────────────────────────────────────────┐
│  QuorumQ · Team Tacos                       🔔  ⚙  👤        │
├────┬─────────────────────────────────────────────────────────┤
│ 🏠 │  Hi Priya 👋                                             │
│ 🍽 │                                                         │
│ 🕓 │  ┌─────── active session hero ─────────────────────────┐│
│ 👥 │  │                                                     ││
│ ⚙  │  └─────────────────────────────────────────────────────┘│
│    │                                                         │
│    │  ┌── Recent winners ──┐  ┌── Upcoming ─────┐           │
│    │  │ ...                │  │ ...             │           │
│    │  └────────────────────┘  └─────────────────┘           │
└────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Create team (L2-01)

Full-screen form (xs) or dialog (md+). Mobile:

```
┌───────────────────────────────────┐
│  ←  New team                      │
├───────────────────────────────────┤
│                                   │
│   Name your team                  │   headline-small
│                                   │
│  Team name                        │
│  ┌───────────────────────────────┐│
│  │ Team Tacos                    ││
│  └───────────────────────────────┘│
│  3–50 characters · 10 / 50        │   label-medium counter
│                                   │
│  Description (optional)           │
│  ┌───────────────────────────────┐│
│  │ Our Wednesday lunch crew.     ││
│  │                               ││
│  └───────────────────────────────┘│
│  0 / 200                          │
│                                   │
│  Team color                       │   6 circular swatches, radio-group
│  ● ○ ○ ○ ○ ○                      │   tomato, herb, amber, …
│                                   │
│  ┌───────────────────────────────┐│
│  │        Create team            ││
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

Validation (L2-01 AC 2):

- **<3 chars** — below field: "Team name must be at least 3 characters."
- **>50 chars** — live counter turns error color at 51.
- Submit disabled until valid.

On success → redirect to dashboard with a snackbar: "Team Tacos created".

---

## 3. Invite (L2-02)

Accessed via **Team › Members › Invite** or FAB on Members screen.

```
┌───────────────────────────────────┐
│  ←  Invite to Team Tacos          │
├───────────────────────────────────┤
│                                   │
│   Invite link                     │   title-medium
│  ┌───────────────────────────────┐│
│  │ https://quorum.q/inv/ab12c…  ⎘ ││   read-only field + copy icon
│  └───────────────────────────────┘│
│  Link expires in 7 days.          │   body-small (muted)
│                                   │
│  ┌───────────────────────────────┐│
│  │         Copy link             ││   tonal
│  └───────────────────────────────┘│
│  ┌───────────────────────────────┐│
│  │         Share                 ││   filled (uses navigator.share)
│  └───────────────────────────────┘│
│                                   │
│   ·──────── or by email ────────· │
│                                   │
│  Email addresses (comma-separated)│
│  ┌───────────────────────────────┐│
│  │ alex@team.com, sam@team.com   ││
│  └───────────────────────────────┘│
│  ┌───────────────────────────────┐│
│  │         Send invites          ││
│  └───────────────────────────────┘│
│                                   │
│   ·──────── danger zone ────────· │
│                                   │
│  Revoke link                      │   text button, error color
└───────────────────────────────────┘
```

Copy success → snackbar "Invite link copied" with UNDO-style `Regenerate`
action.

---

## 4. Accept invite (L2-02 AC 2 / AC 3)

Valid link, user signed in:

```
┌───────────────────────────────────┐
│                                   │
│              👥                    │
│                                   │
│   You're invited to               │   body-large
│     Team Tacos                    │   headline-small
│                                   │
│   2 existing members              │   body-medium
│   Invited by Priya Patel          │
│                                   │
│  ┌───────────────────────────────┐│
│  │         Join team             ││   filled primary
│  └───────────────────────────────┘│
│  ┌───────────────────────────────┐│
│  │          Decline              ││   outlined
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

Invalid / expired link (L2-02 AC 3):

```
┌───────────────────────────────────┐
│                                   │
│              ⚠                    │   icon-hero, error color
│                                   │
│   Invite no longer valid          │   headline-small
│                                   │
│   This invite has expired or was  │   body-medium
│   revoked by the team owner.      │
│                                   │
│  ┌───────────────────────────────┐│
│  │     Contact the inviter       ││   tonal; opens mailto:
│  └───────────────────────────────┘│
│  ┌───────────────────────────────┐│
│  │     Back to home              ││   text
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

---

## 5. Team members list

```
┌───────────────────────────────────┐
│  ←  Members                       │
├───────────────────────────────────┤
│                                   │
│  ┌───────────────────────────────┐│
│  │ 🔍  Search members            ││   search field (collapses on focus)
│  └───────────────────────────────┘│
│                                   │
│  👑 Priya Patel          (Owner) │   list item, trailing chip
│    priya@team.com                 │
│  ─────────────────────────────    │
│  👤 Jordan Lee        (Admin)    │
│    jordan@team.com                │
│  ─────────────────────────────    │
│  👤 Sam Kim          (Member)    │
│    sam@team.com                   │
│                                   │
├───────────────────────────────────┤
│                     ┌────────┐    │   extended FAB on md+,
│                     │  +Invite│   │   circular FAB on xs
│                     └────────┘    │
└───────────────────────────────────┘
```

Owner/admin can tap a member to open an overflow menu:

```
  ┌─────────────────────────┐
  │  Change role          ▸ │
  │  Remove from team       │   error color
  └─────────────────────────┘
```

Removal confirmation is a destructive dialog — see `11-dialogs.md §3`.

---

## 6. No teams yet (L2-03 AC 2)

```
┌───────────────────────────────────┐
│                                   │
│             🍽                     │   icon-hero
│                                   │
│   Let's get you fed                │   headline-small
│   Create a team or enter an       │   body-medium
│   invite code to join one.        │
│                                   │
│  ┌───────────────────────────────┐│
│  │     Create a team             ││   filled primary
│  └───────────────────────────────┘│
│  ┌───────────────────────────────┐│
│  │     Enter invite code         ││   tonal
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

Submit of an invite code validates on the server; invalid codes show an
inline error ("We can't find that invite.") beneath the input.

---

## 7. Angular Material components used

- `mat-toolbar`, `mat-sidenav-container` (team switcher drawer)
- `mat-card`, `mat-list`, `mat-nav-list`
- `mat-form-field` with `matInput` + hint + error
- `mat-chip-set`, `mat-chip`
- `mat-icon-button`, `mat-button` (filled/tonal/outlined/text)
- `mat-fab` / `mat-fab-extended`
- `mat-dialog` (create team on md+, confirm delete)
- `mat-snack-bar` for "Team created", "Invite link copied"
