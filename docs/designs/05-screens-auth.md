# 05 · Auth Screens

**Traces to:** L2-04, L2-05, L2-06

All auth screens share a single centered layout (one column, max-width
400 px on xs/sm, 480 px on md+). The brand mark is `headline-medium` in the
display family. No persistent nav is rendered before sign-in.

---

## 1. Landing / splash

```
┌───────────────────────────────────┐
│                                   │
│                                   │
│              🍽                    │   icon-hero (64 px), tertiary
│                                   │
│           QuorumQ                 │   display-small, display family
│   Where should we eat today?      │   body-large · on-surface-variant
│                                   │
│                                   │
│   ┌─────────────────────────────┐ │
│   │          Sign in            │ │   filled primary button
│   └─────────────────────────────┘ │
│   ┌─────────────────────────────┐ │
│   │      Create an account      │ │   tonal button
│   └─────────────────────────────┘ │
│                                   │
│   ·────── or continue with ──────·│
│                                   │
│   [ Google ] [ Microsoft ] [ GH ] │   outlined icon + label buttons
│                                   │
└───────────────────────────────────┘
 page padding space-6 (24), buttons full-width, space-4 between
```

Notes:
- Social providers are optional (L2-04 "OAuth where supported").
- The copy `Where should we eat today?` is set in Inter; the mark `QuorumQ`
  uses Fraunces for warmth.

---

## 2. Sign in (L2-05)

```
┌───────────────────────────────────┐
│  ←  Sign in                       │   app bar, back chevron
├───────────────────────────────────┤
│                                   │
│         Welcome back              │   headline-small, space-9 top
│                                   │
│  Email                            │   mat-form-field outlined
│  ┌───────────────────────────────┐│
│  │ you@team.com                  ││
│  └───────────────────────────────┘│
│                                   │   space-4
│  Password                         │
│  ┌───────────────────────────────┐│
│  │ •••••••••              👁      ││
│  └───────────────────────────────┘│
│  Forgot password?                 │   text button, trailing
│                                   │   space-6
│  ┌───────────────────────────────┐│
│  │          Sign in              ││   filled primary, full-width
│  └───────────────────────────────┘│
│                                   │
│  New here? Create an account      │   text link (mat-button)
└───────────────────────────────────┘
```

States:

- **Resting** — primary button enabled when both fields non-empty.
- **Submitting** — button shows spinner; fields become read-only.
- **Error (wrong password)** — inline snackbar "Email or password incorrect."
  Password field `aria-invalid=true`. Focus returns to password input.
- **Rate-limited (L2-05 AC 3)** — after 3 failed attempts:

```
 ┌────────────────────────────────────┐   error-container bg, on-error-container text
 │  ⚠  Too many attempts              │
 │  Try again in 00:30.               │
 └────────────────────────────────────┘
 Primary button disabled with a live countdown in its label:
 [  Sign in · 00:30  ]
```

---

## 3. Create account (L2-04)

```
┌───────────────────────────────────┐
│  ←  Create account                │
├───────────────────────────────────┤
│                                   │
│     Start eating together         │   headline-small
│                                   │
│  Name                             │
│  ┌───────────────────────────────┐│
│  │ Priya Patel                   ││
│  └───────────────────────────────┘│
│                                   │
│  Email                            │
│  ┌───────────────────────────────┐│
│  │ priya@team.com                ││
│  └───────────────────────────────┘│
│                                   │
│  Password                         │
│  ┌───────────────────────────────┐│
│  │ •••••••        👁              ││
│  └───────────────────────────────┘│
│  ▰▰▰▰▱▱▱  Good                     │   strength bar
│  · 8+ characters                ✓  │
│  · one number                   ✓  │
│  · one symbol                   ✗  │   error color until satisfied
│                                   │
│  ☐  I agree to the Terms          │
│                                   │
│  ┌───────────────────────────────┐│
│  │        Create account         ││   filled primary
│  └───────────────────────────────┘│
│                                   │
│  Already have an account? Sign in │   text link
└───────────────────────────────────┘
```

Submit disabled until strength ≥ "Good" (all three rules ✓) and terms
checked. Weak-password attempt: button stays disabled, strength rules are
announced via `aria-live="polite"`.

---

## 4. Verify email (L2-04 AC 2)

Shown inline as a banner at the top of the dashboard until verified:

```
 ┌───────────────────────────────────────────────┐
 │  ✉  Verify your email                         │   tertiary-container bg
 │  We sent a link to priya@team.com.            │
 │                     Resend   I've verified    │   text buttons
 └───────────────────────────────────────────────┘
```

Attempting a gated action (create team, vote) while unverified opens a
dialog:

```
 ┌─────────────────────────────────────────────────┐
 │  Verify your email first                        │
 │  ───────────────────────────                    │
 │  You'll be able to create teams and vote once   │
 │  your email is confirmed.                       │
 │                                                 │
 │               Resend email       Close          │   filled + text
 └─────────────────────────────────────────────────┘
```

---

## 5. Forgot password

```
┌───────────────────────────────────┐
│  ←  Reset password                │
├───────────────────────────────────┤
│                                   │
│     Reset your password           │   headline-small
│                                   │
│  Enter the email you signed up    │
│  with and we'll send a reset      │   body-medium
│  link.                            │
│                                   │
│  Email                            │
│  ┌───────────────────────────────┐│
│  │ priya@team.com                ││
│  └───────────────────────────────┘│
│                                   │
│  ┌───────────────────────────────┐│
│  │        Send reset link        ││
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

After submit → "Check your inbox" confirmation view (body-large + inline
`Open mail` tonal button on iOS/Android, hidden on desktop).

---

## 6. Session expired (L2-06 AC 2)

Modal dialog overlaying the current screen; dismissible only by signing in
or cancelling (which signs out locally).

```
 ┌─────────────────────────────────────────────────┐
 │  Session expired                                │
 │  ───────────────────────────                    │
 │  Please sign in again. We'll bring you back to  │
 │  where you were.                                │
 │                                                 │
 │  Password                                       │
 │  ┌────────────────────────────────────────────┐ │
 │  │ •••••••••                                  │ │
 │  └────────────────────────────────────────────┘ │
 │                                                 │
 │                       Sign out      Sign in     │   text + filled
 └─────────────────────────────────────────────────┘
```

The email is pre-filled from the cached profile (read-only); only the
password is requested. On success the user returns to the previous URL.

---

## 7. Responsive behavior

```
xs (375)         sm (640)          md (905+)
┌───────────┐   ┌─────────────┐   ┌──────────────┐┌────────────────┐
│ full card │   │ full card   │   │  brand panel ││  form card     │
│           │   │ centered    │   │  (primary-   ││  centered on   │
│           │   │ 480 max     │   │  container   ││  surface       │
│           │   │             │   │  illustration)││  480 max       │
└───────────┘   └─────────────┘   └──────────────┘└────────────────┘
```

On `md+` the left half becomes a **brand panel** with the mark on
`primary-container` and a subtle illustration; the form card remains on
`surface`.

---

## 8. A11y specifics

- First focus on sign-in/create-account is the **email** input.
- Labels use floating `mat-label`; never rely on placeholder only.
- Password field sets `autocomplete="current-password"` (sign-in) and
  `"new-password"` (create account).
- Strength rules are an `<ul role="list">` and the whole container has
  `aria-live="polite"` so changes are announced.
- The "Sign out" action in the session-expired dialog is labeled
  "Sign out and return to landing" for screen-reader clarity.
