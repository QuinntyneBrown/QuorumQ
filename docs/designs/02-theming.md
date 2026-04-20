# 02 · Theming (Light & Dark)

**Traces to:** L2-24, L2-26 (Dark & Light themes), L2-46 (Angular Material)

QuorumQ ships a single Material 3 theme definition with two modes — **light**
(default on a light OS preference) and **dark** (default on a dark OS
preference). The user can override it, and the override is stored per-user on
the server so it follows them across devices (L2-26 AC 2).

## 1. Theme strategy

- One `mat.define-theme()` call per mode (light, dark). Both share the same
  source palettes (§1.1 of `01-design-tokens.md`).
- Applied by attaching a class to `<html>`:
  - no class → light (default)
  - `.theme-dark` → dark
- Media query `@media (prefers-color-scheme: dark)` selects the initial class
  via a tiny inline script in `index.html` (no FOUC).
- User's persisted preference overrides the OS preference on sign-in; cleared
  on sign-out.

## 2. Theme switcher states

```
Settings › Appearance
┌─────────────────────────────────────────────┐
│  Theme                                      │
│                                             │
│  ○ System     ● Light     ○ Dark            │
│                                             │
│  Used across every device you sign in on.   │
└─────────────────────────────────────────────┘
```

Control: `mat-button-toggle-group` with 3 options (System / Light / Dark),
bound to the signed-in user's profile setting. Icon inside each toggle:
`brightness_auto`, `light_mode`, `dark_mode`.

## 3. Light theme — surface composition

```
┌────────────────────────────────────────────────┐  surface              #FBF7F1
│  ┌──────────────────────────────────────────┐  │
│  │  Top app bar (elev-2 when scrolled)      │  │  surface-container    #F0ECE6
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Card                                    │  │  surface-container-low #F5F1EB
│  │  (elev-1)                                │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Bottom sheet / menu                     │  │  surface-container-high #EAE6E0
│  │  (elev-2)                                │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

## 4. Dark theme — surface composition

Dark theme uses **surface tint** — a primary-tinted overlay whose opacity
increases with elevation — baked into each `surface-container-*` step.

```
┌────────────────────────────────────────────────┐  surface              #141312
│  ┌──────────────────────────────────────────┐  │
│  │  Top app bar                             │  │  surface-container    #201F1D
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Card                                    │  │  surface-container-low #1C1B19
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Dialog                                  │  │  surface-container-high #2B2A27
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

In dark mode, brand-`primary` is replaced by **`inverse-primary`** (Primary
tone 80, `#FFB4A6`) for buttons and accents — this keeps contrast high while
preserving brand recognition.

## 5. Role mapping reference

See `01-design-tokens.md` §1.2 and §1.3 for every role and its hex value.

The following components shift meaningfully between light and dark; check
each in both modes:

| Component            | Light detail                            | Dark detail                           |
|----------------------|-----------------------------------------|---------------------------------------|
| `mat-fab` (primary)  | `primary` bg, `on-primary` icon         | `primary-container` bg, `on-primary-container` icon |
| Filled button        | `primary` bg                            | `primary` bg (shifts to tone 80)      |
| Elevated card        | `surface-container-low`                 | `surface-container-low` + tint overlay |
| Snackbar             | `inverse-surface` bg, `inverse-on-surface` text | `inverse-surface` bg           |
| Chip (filter, selected) | `secondary-container` bg             | `secondary-container` bg              |
| Session-state badge  | `--qq-color-state-*` bg @ 100 %         | `--qq-color-state-*` bg @ 100 %, text swaps to `on-*` |

## 6. Branded loading screen (FOUC prevention)

```
<!-- index.html -->
<style>
  :root { background: #FBF7F1; color-scheme: light; }
  @media (prefers-color-scheme: dark) {
    :root { background: #141312; color-scheme: dark; }
  }
</style>
<script>
  (function () {
    try {
      var t = localStorage.getItem('qq-theme');
      if (t === 'dark') document.documentElement.classList.add('theme-dark');
      else if (t === 'system' || !t) {
        if (matchMedia('(prefers-color-scheme: dark)').matches)
          document.documentElement.classList.add('theme-dark');
      }
    } catch (_) {}
  })();
</script>
```

The inline script is < 500 bytes and runs before Angular boots, so the very
first paint already matches the final theme.

## 7. Color usage rules

- **Never** pick a raw hex inside a component. Reference a role token.
- **Primary** is for the single most important action on a surface (max one
  filled primary button per region).
- **Tertiary** (`amber`) is reserved for celebration — the winner reveal,
  success confetti, streak badges. Don't use it for generic emphasis.
- **Error** is only for validation failures and destructive-confirmation
  accents, never for emphasis.
- **State colors** (`state-suggesting / voting / decided / cancelled`) never
  appear as a fill behind body text — only as chip tints, progress bars, and
  status dots.

## 8. Theme QA checklist

For every new component, verify in both themes:

- [ ] All text pairs pass WCAG AA (≥ 4.5:1 body, ≥ 3:1 large).
- [ ] No raw hex in the template or SCSS.
- [ ] Hover / focus / pressed / disabled states are distinguishable.
- [ ] Icons inherit their container's `on-*` role.
- [ ] Shadow is visible in light mode; surface-tint is visible in dark mode.
- [ ] No color is the only signal for state (pair with icon / text / shape).
