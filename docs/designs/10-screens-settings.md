# 10 · Settings Screens

**Traces to:** L2-26, L2-40, L2-43

Settings is the ⚙ destination accessible from the top app bar menu or
account avatar. Organized as sections, each in its own card on md+ and
stacked single-column on xs.

---

## 1. Settings index (mobile)

```
┌───────────────────────────────────┐
│  ←  Settings                      │
├───────────────────────────────────┤
│                                   │
│  Account                          │   section label, label-large
│  ┌─────────────────────────────┐  │
│  │ 👤  Priya Patel            › │  │   nav list item
│  │     priya@team.com           │  │
│  └─────────────────────────────┘  │
│                                   │
│  Appearance                       │
│  ┌─────────────────────────────┐  │
│  │ 🎨  Theme              Light › │  │
│  └─────────────────────────────┘  │
│                                   │
│  Notifications                    │
│  ┌─────────────────────────────┐  │
│  │ 🔔  Notifications          › │  │
│  └─────────────────────────────┘  │
│                                   │
│  Teams                            │
│  ┌─────────────────────────────┐  │
│  │ 👥  Your teams · 3         › │  │
│  └─────────────────────────────┘  │
│                                   │
│  About                            │
│  ┌─────────────────────────────┐  │
│  │ ℹ  About QuorumQ          › │  │
│  │ 📘  Privacy & Terms        › │  │
│  └─────────────────────────────┘  │
│                                   │
│  ───────────────────────────────  │
│  ┌─────────────────────────────┐  │
│  │         Sign out             │  │   outlined, error text
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

On md+ the same sections become a two-column layout: left is the section
list (selected highlight), right is the section's settings.

---

## 2. Account

```
┌───────────────────────────────────┐
│  ←  Account                       │
├───────────────────────────────────┤
│                                   │
│                 👤                 │   avatar 96 px, centered
│                                   │
│       Priya Patel                 │   title-large, centered
│       priya@team.com              │   body-medium (muted)
│                                   │
│  ┌─────────────────────────────┐  │
│  │     Change avatar           │  │   text button
│  └─────────────────────────────┘  │
│                                   │
│  Name                             │
│  ┌─────────────────────────────┐  │
│  │ Priya Patel                 │  │
│  └─────────────────────────────┘  │
│                                   │
│  Email                            │
│  ┌─────────────────────────────┐  │
│  │ priya@team.com              │  │   read-only until "Change email" flow
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │     Change password         │  │   tonal
│  └─────────────────────────────┘  │
│                                   │
│  ───────────────────────────────  │
│  Danger zone                      │   label-large, error color
│  ┌─────────────────────────────┐  │
│  │     Delete my account       │  │   outlined, error content
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

---

## 3. Theme (L2-26)

```
┌───────────────────────────────────┐
│  ←  Theme                         │
├───────────────────────────────────┤
│                                   │
│  Theme                            │
│  ┌──────────┬──────────┬──────────┐
│  │  System  │  Light   │   Dark   │   mat-button-toggle-group
│  │    🌗     │    ☀     │    🌙     │
│  └──────────┴──────────┴──────────┘
│  Used across every device.        │   body-small (muted)
│                                   │
│  Preview                          │
│  ┌─────────────────────────────┐  │
│  │                              │ │   miniature of the dashboard
│  │  ░░ ░░░░░░  ░░░░             │ │   rendered in the selected theme
│  │  ░░░░░░░░                    │ │   (live preview)
│  │  ┌──────────┐                │ │
│  │  │ Primary  │                │ │
│  │  └──────────┘                │ │
│  └─────────────────────────────┘  │
│                                   │
│  Reduce motion                    │   subsection
│  ● ●────   off · on             │
│  Follow OS setting   ●             │   default
│  Override: off · on                │
└───────────────────────────────────┘
```

Preview is a tiny live component rendered inside the card with the selected
theme class scoped to it, so the user can see the effect without full-screen
flicker.

---

## 4. Notifications (L2-40)

```
┌───────────────────────────────────┐
│  ←  Notifications                 │
├───────────────────────────────────┤
│                                   │
│  All notifications       ──●      │   master toggle (mat-slide-toggle)
│                                   │
│  Per-team                         │   label-large
│                                   │
│  ┌─────────────────────────────┐  │
│  │ 🍽 Team Tacos        ──●    │  │
│  │                              │ │
│  │   ☑ Lunch started            │ │   checkbox per event type
│  │   ☑ Voting started           │ │
│  │   ☑ 5 minutes remaining      │ │
│  │   ☑ Winner decided           │ │
│  └─────────────────────────────┘  │
│  ┌─────────────────────────────┐  │
│  │ 🍽 Engineering       ○──    │  │   disabled entire card
│  │                              │ │   (L2-40: no further notifications)
│  │   ☐ Lunch started            │ │
│  │   ☐ Voting started           │ │
│  │   ☐ 5 minutes remaining      │ │
│  │   ☐ Winner decided           │ │
│  └─────────────────────────────┘  │
│                                   │
│  Quiet hours                      │
│  ┌─────────────────────────────┐  │
│  │ 22:00 — 08:00       ──●    │  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

Disabling `All notifications` collapses the per-team cards into a non-
interactive summary "Notifications paused".

---

## 5. Delete account (L2-43)

Destructive; requires double confirmation and password re-entry.

Step 1 — confirmation dialog:

```
┌─────────────────────────────────────────────────┐
│  Delete your account?                           │
│  ───────────────────────────                    │
│  This will delete your profile and anonymize    │
│  your past votes, comments, and reviews to      │
│  "former member" within 30 days.                │
│                                                 │
│  Your teams will not be deleted, but you will   │
│  no longer be a member of them.                 │
│                                                 │
│                                Cancel   Next    │   outlined + filled (error)
└─────────────────────────────────────────────────┘
```

Step 2 — password re-entry:

```
┌─────────────────────────────────────────────────┐
│  Confirm deletion                               │
│  ───────────────────────────                    │
│  Enter your password and type DELETE to         │
│  confirm.                                       │
│                                                 │
│  Password                                       │
│  ┌────────────────────────────────────────────┐ │
│  │ •••••••••                                  │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│  Type DELETE                                    │
│  ┌────────────────────────────────────────────┐ │
│  │ DELETE                                     │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│                                Cancel   Delete  │   filled (error role), disabled
│                                                 │   until both fields valid
└─────────────────────────────────────────────────┘
```

Success → full-screen confirmation and sign-out:

```
┌───────────────────────────────────┐
│                                   │
│              ✓                     │   icon-hero, tertiary
│                                   │
│   Account deletion queued         │   headline-small
│   We'll finish up within 30 days. │   body-medium
│                                   │
│  ┌───────────────────────────────┐│
│  │      Back to landing          ││
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

---

## 6. About

Static content: app version, OSS licenses, a one-line privacy statement, a
link to the privacy/terms pages. Rendered as a `mat-list` of nav items.

---

## 7. Angular Material components used

- `mat-toolbar`, `mat-list`, `mat-nav-list`
- `mat-form-field`, `matInput`
- `mat-button-toggle-group` (theme picker)
- `mat-slide-toggle`, `mat-checkbox`
- `mat-button` (filled / tonal / outlined / text, plus error-color filled for
  destructive)
- `mat-dialog`, `mat-snack-bar`
