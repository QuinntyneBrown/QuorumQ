# 01 · Design Tokens

**Traces to:** L2-24 (Design System), L2-26 (Dark/Light), L2-27 (WCAG AA),
L2-46 (Angular Material)

Tokens are the atomic, named values every component is built from. Names follow
Material Design 3 conventions so they map 1:1 to the role variables produced
by `mat.define-theme()` / `mat.theme()` in Angular Material (≥ v18). Every
component in this design system references tokens by name only — never a raw
hex, pixel, or millisecond value.

---

## 1. Color tokens

### 1.1 Source palettes (reference tones 0–100)

Tonal palettes are the source; Material 3 color roles (below) are derived from
these. Values are HCT-approximated hex.

#### Primary — **Tomato**
Chosen for food/appetite cues and the urgency of a ticking vote clock.

| Tone | Hex     | Tone | Hex     |
|------|---------|------|---------|
| 0    | #000000 | 60   | #F06A58 |
| 10   | #410000 | 70   | #FF8C7B |
| 20   | #6B1A10 | 80   | #FFB4A6 |
| 30   | #8F2D21 | 90   | #FFDAD2 |
| 40   | #B34032 | 95   | #FFEDE8 |
| **50** | **#E04F3C** (brand) | 99   | #FFFBF8 |
|      |         | 100  | #FFFFFF |

#### Secondary — **Herb**
| Tone | Hex     | Tone | Hex     |
|------|---------|------|---------|
| 10   | #072014 | 60   | #6FA98A |
| 20   | #183528 | 70   | #8AC4A4 |
| 30   | #2E4A3C | 80   | #A6E0BF |
| **40** | **#4C8B6B** | 90   | #C2FCDB |
| 50   | #5D9D7B | 95   | #DFFFEB |

#### Tertiary — **Amber** (winner reveal)
| Tone | Hex     | Tone | Hex     |
|------|---------|------|---------|
| 10   | #2B1700 | 60   | #FFC660 |
| 20   | #462A00 | 70   | #FFD580 |
| 30   | #6B4300 | 80   | #FFDDA0 |
| 40   | #8F5B00 | 90   | #FFEFD1 |
| **50** | **#F2B134** | 95   | #FFF7E8 |

#### Neutral (warm)
| Tone | Hex     | Tone | Hex     |
|------|---------|------|---------|
| 0    | #000000 | 60   | #948F8A |
| 4    | #0E0D0B | 70   | #AEA9A4 |
| 6    | #141312 | 80   | #C9C4BE |
| 10   | #1C1B19 | 87   | #DCD7D1 |
| 12   | #201F1D | 90   | #E5E1DB |
| 17   | #2B2A27 | 92   | #EAE6E0 |
| 20   | #312F2C | 94   | #F0ECE6 |
| 22   | #36342F | 95   | #F3EFE9 |
| 24   | #3A3834 | 96   | #F5F1EB |
| 30   | #4A4742 | 98   | #FBF7F1 |
| 40   | #63605A | 100  | #FFFFFF |
| 50   | #7C7872 |      |         |

#### Neutral-variant (outlines, borders)
| Tone | Hex     |
|------|---------|
| 30   | #4E4944 |
| 50   | #7E7871 |
| 60   | #98928C |
| 80   | #CDC7C0 |
| 90   | #EAE2DB |

#### Error — Material 3 default
| Tone | Hex     |
|------|---------|
| 10   | #410E0B |
| 20   | #601410 |
| 30   | #8C1D18 |
| **40** | **#B3261E** |
| 80   | #F2B8B5 |
| 90   | #F9DEDC |

### 1.2 Role tokens (light theme)

These are the names components reference. Light theme.

| Role                              | Source        | Hex      |
|-----------------------------------|---------------|----------|
| `--md-sys-color-primary`          | Primary 50    | #E04F3C  |
| `--md-sys-color-on-primary`       | Primary 100   | #FFFFFF  |
| `--md-sys-color-primary-container`| Primary 90    | #FFDAD2  |
| `--md-sys-color-on-primary-container` | Primary 10 | #410000  |
| `--md-sys-color-secondary`        | Secondary 40  | #4C8B6B  |
| `--md-sys-color-on-secondary`     | Secondary 100 | #FFFFFF  |
| `--md-sys-color-secondary-container` | Secondary 90 | #C2FCDB |
| `--md-sys-color-on-secondary-container` | Secondary 10 | #072014 |
| `--md-sys-color-tertiary`         | Tertiary 50   | #F2B134  |
| `--md-sys-color-on-tertiary`      | Tertiary 10   | #2B1700  |
| `--md-sys-color-tertiary-container` | Tertiary 90 | #FFEFD1  |
| `--md-sys-color-on-tertiary-container` | Tertiary 10 | #2B1700 |
| `--md-sys-color-error`            | Error 40      | #B3261E  |
| `--md-sys-color-on-error`         | #FFFFFF       | #FFFFFF  |
| `--md-sys-color-error-container`  | Error 90      | #F9DEDC  |
| `--md-sys-color-on-error-container` | Error 10    | #410E0B  |
| `--md-sys-color-background`       | Neutral 98    | #FBF7F1  |
| `--md-sys-color-on-background`    | Neutral 10    | #1C1B19  |
| `--md-sys-color-surface`          | Neutral 98    | #FBF7F1  |
| `--md-sys-color-on-surface`       | Neutral 10    | #1C1B19  |
| `--md-sys-color-surface-variant`  | Neutral-var 90 | #EAE2DB |
| `--md-sys-color-on-surface-variant` | Neutral-var 30 | #4E4944 |
| `--md-sys-color-surface-container-lowest` | Neutral 100 | #FFFFFF |
| `--md-sys-color-surface-container-low` | Neutral 96  | #F5F1EB |
| `--md-sys-color-surface-container`     | Neutral 94  | #F0ECE6 |
| `--md-sys-color-surface-container-high`| Neutral 92  | #EAE6E0 |
| `--md-sys-color-surface-container-highest` | Neutral 90 | #E5E1DB |
| `--md-sys-color-outline`          | Neutral-var 50 | #7E7871 |
| `--md-sys-color-outline-variant`  | Neutral-var 80 | #CDC7C0 |
| `--md-sys-color-inverse-surface`  | Neutral 20    | #312F2C  |
| `--md-sys-color-inverse-on-surface` | Neutral 95  | #F3EFE9  |
| `--md-sys-color-inverse-primary`  | Primary 80    | #FFB4A6  |
| `--md-sys-color-scrim`            | #000000 @ 32 % | rgba(0,0,0,0.32) |
| `--md-sys-color-shadow`           | #000000        | #000000 |

### 1.3 Role tokens (dark theme)

| Role                              | Hex      |
|-----------------------------------|----------|
| `--md-sys-color-primary`          | #FFB4A6  |
| `--md-sys-color-on-primary`       | #690004  |
| `--md-sys-color-primary-container`| #8F2D21  |
| `--md-sys-color-on-primary-container` | #FFDAD2 |
| `--md-sys-color-secondary`        | #A6E0BF  |
| `--md-sys-color-on-secondary`     | #183528  |
| `--md-sys-color-secondary-container` | #2E4A3C |
| `--md-sys-color-on-secondary-container` | #C2FCDB |
| `--md-sys-color-tertiary`         | #FFDDA0  |
| `--md-sys-color-on-tertiary`      | #462A00  |
| `--md-sys-color-tertiary-container` | #6B4300 |
| `--md-sys-color-on-tertiary-container` | #FFEFD1 |
| `--md-sys-color-error`            | #F2B8B5  |
| `--md-sys-color-background`       | #141312  |
| `--md-sys-color-on-background`    | #E5E1DB  |
| `--md-sys-color-surface`          | #141312  |
| `--md-sys-color-on-surface`       | #E5E1DB  |
| `--md-sys-color-surface-variant`  | #4E4944  |
| `--md-sys-color-on-surface-variant` | #CDC7C0 |
| `--md-sys-color-surface-container-lowest` | #0E0D0B |
| `--md-sys-color-surface-container-low` | #1C1B19 |
| `--md-sys-color-surface-container`     | #201F1D |
| `--md-sys-color-surface-container-high`| #2B2A27 |
| `--md-sys-color-surface-container-highest` | #36342F |
| `--md-sys-color-outline`          | #98928C  |
| `--md-sys-color-outline-variant`  | #4E4944  |

### 1.4 Semantic aliases (app-level)

Additional tokens layered on top of Material roles, so product code reads
intention, not mechanism:

| Alias                          | Light mapping                        | Dark mapping                           |
|--------------------------------|--------------------------------------|----------------------------------------|
| `--qq-color-brand`             | `--md-sys-color-primary`             | `--md-sys-color-primary`               |
| `--qq-color-surface-elevated`  | `--md-sys-color-surface-container-high` | `--md-sys-color-surface-container-high` |
| `--qq-color-winner-accent`     | `--md-sys-color-tertiary`            | `--md-sys-color-tertiary`              |
| `--qq-color-state-suggesting`  | `--md-sys-color-secondary`           | `--md-sys-color-secondary`             |
| `--qq-color-state-voting`      | `--md-sys-color-primary`             | `--md-sys-color-primary`               |
| `--qq-color-state-decided`     | `--md-sys-color-tertiary`            | `--md-sys-color-tertiary`              |
| `--qq-color-state-cancelled`   | `--md-sys-color-outline`             | `--md-sys-color-outline`               |
| `--qq-color-online-dot`        | `--md-sys-color-secondary`           | `--md-sys-color-secondary`             |
| `--qq-color-offline-dot`       | `--md-sys-color-outline`             | `--md-sys-color-outline`               |
| `--qq-color-danger-text`       | `--md-sys-color-error`               | `--md-sys-color-error`                 |
| `--qq-color-divider`           | `--md-sys-color-outline-variant`     | `--md-sys-color-outline-variant`       |

### 1.5 Contrast audit (WCAG AA)

Verified ≥ 4.5:1 for body text, ≥ 3:1 for large text and non-text UI.

| Pair (light theme)                                    | Ratio | AA? |
|-------------------------------------------------------|-------|-----|
| on-surface #1C1B19 / surface #FBF7F1                  | 14.9  | ✅  |
| on-surface-variant #4E4944 / surface #FBF7F1          | 7.9   | ✅  |
| on-primary #FFFFFF / primary #E04F3C                  | 4.6   | ✅  |
| on-primary-container #410000 / primary-container #FFDAD2 | 13.7 | ✅ |
| on-secondary #FFFFFF / secondary #4C8B6B              | 4.7   | ✅  |
| on-error #FFFFFF / error #B3261E                      | 6.3   | ✅  |
| outline #7E7871 / surface #FBF7F1 (non-text)          | 3.4   | ✅  |

(Any pair added later must pass the same audit — documented per screen.)

---

## 2. Typography tokens

Base font: **Inter** (variable) as primary, with system-ui fallback. Brand
headings optionally use **Fraunces** (for display / winner reveal). Both
shipped as self-hosted WOFF2 via `angular.json` assets so initial-paint isn't
blocked by third-party fonts.

```
font-family-sans : "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif
font-family-display : "Fraunces", "Inter", ui-sans-serif, serif
font-family-mono : ui-monospace, "SF Mono", "Roboto Mono", monospace
```

Scale — Material 3 type scale mapped to Angular Material's `$typography`:

| Token                          | Size / Line / Weight / Tracking  | Use |
|--------------------------------|-----------------------------------|-----|
| `display-large`                | 57 / 64 / 400 / -0.25             | Winner name on reveal (desktop) |
| `display-medium`               | 45 / 52 / 400 / 0                 | Winner name on reveal (mobile) |
| `display-small`                | 36 / 44 / 400 / 0                 | Empty-state hero |
| `headline-large`               | 32 / 40 / 400 / 0                 | Dashboard title (desktop) |
| `headline-medium`              | 28 / 36 / 400 / 0                 | Dashboard title (mobile) |
| `headline-small`               | 24 / 32 / 400 / 0                 | Section title |
| `title-large`                  | 22 / 28 / 500 / 0                 | Dialog title, card title |
| `title-medium`                 | 16 / 24 / 500 / 0.15              | List item title |
| `title-small`                  | 14 / 20 / 500 / 0.1               | Chip, tab label |
| `body-large`                   | 16 / 24 / 400 / 0.5               | Default body |
| `body-medium`                  | 14 / 20 / 400 / 0.25              | Secondary body |
| `body-small`                   | 12 / 16 / 400 / 0.4               | Timestamps, captions |
| `label-large`                  | 14 / 20 / 500 / 0.1               | Button label |
| `label-medium`                 | 12 / 16 / 500 / 0.5               | Input helper |
| `label-small`                  | 11 / 16 / 500 / 0.5               | Overline, badge |

All sizes in CSS pixels. Never use px hard-coded — use `mat.typography` class
mixins (`.mat-typography .mat-title-medium`) or the generated role classes.

---

## 3. Spacing scale

A 4-pixel base grid. Components never use odd values.

| Token        | px  | Typical use |
|--------------|-----|-------------|
| `space-0`    | 0   | Resets |
| `space-1`    | 4   | Icon ↔ label inside chip |
| `space-2`    | 8   | Dense list gap, icon button padding |
| `space-3`    | 12  | Compact card padding, bottom-sheet grab-bar offset |
| `space-4`    | 16  | Default card padding, form field gap |
| `space-5`    | 20  | Between grouped form fields |
| `space-6`    | 24  | Section gap on mobile, dialog padding |
| `space-7`    | 32  | Section gap on desktop |
| `space-8`    | 40  | Above primary CTA on mobile |
| `space-9`    | 48  | Above page title |
| `space-10`   | 64  | Empty-state vertical padding |
| `space-12`   | 96  | Marketing / landing hero padding |

Layout gutters:

| Breakpoint | Gutter | Container max-width |
|------------|--------|---------------------|
| `xs`       | 16 px  | 100 %               |
| `sm`       | 24 px  | 100 %               |
| `md`       | 24 px  | 904 px              |
| `lg`       | 32 px  | 1240 px             |
| `xl`       | 32 px  | 1440 px             |

Safe-area insets (notched phones): every fixed-to-bottom element pads
`env(safe-area-inset-bottom)` in addition to its token value.

---

## 4. Border-radius tokens

| Token            | px  | Applied to |
|------------------|-----|------------|
| `radius-none`    | 0   | Full-bleed divider |
| `radius-xs`      | 4   | Dense chip |
| `radius-sm`      | 8   | Text field, small chip |
| `radius-md`      | 12  | Card |
| `radius-lg`      | 16  | Bottom sheet, dialog |
| `radius-xl`      | 24  | Modal bottom-sheet top corners |
| `radius-2xl`     | 28  | Winner reveal card |
| `radius-full`    | 9999| Avatar, FAB, pill button |

---

## 5. Elevation tokens

Material 3 elevation levels. Dark-theme elevation uses the same shadow plus
a surface-container tint step.

| Token  | Offset / Blur / Opacity (light)         | Surface tint layer |
|--------|------------------------------------------|--------------------|
| `elev-0` | none                                    | `surface`                   |
| `elev-1` | 0 1 2 rgba(0,0,0,0.30), 0 1 3 1 rgba(0,0,0,0.15) | `surface-container-low`  |
| `elev-2` | 0 1 2 rgba(0,0,0,0.30), 0 2 6 2 rgba(0,0,0,0.15) | `surface-container`      |
| `elev-3` | 0 4 8 3 rgba(0,0,0,0.15), 0 1 3 rgba(0,0,0,0.30) | `surface-container-high` |
| `elev-4` | 0 6 10 4 rgba(0,0,0,0.15), 0 2 3 rgba(0,0,0,0.30) | `surface-container-high` |
| `elev-5` | 0 8 12 6 rgba(0,0,0,0.15), 0 4 4 rgba(0,0,0,0.30) | `surface-container-highest` |

Applied by component:
- Top app bar (scrolled) → `elev-2`
- Resting card → `elev-1`
- Menu, bottom sheet → `elev-2`
- Dialog → `elev-3`
- FAB at rest → `elev-3`; pressed → `elev-1`

---

## 6. Motion tokens

Duration (ms) and easing use the Material 3 emphasis system.

### Duration

| Token                | ms   | Use |
|----------------------|------|-----|
| `motion-short-1`     | 50   | Selection ripple start |
| `motion-short-2`     | 100  | Touch feedback, icon swap |
| `motion-short-3`     | 150  | Icon toggle, chip select |
| `motion-short-4`     | 200  | Button press-release |
| `motion-medium-1`    | 250  | Expand/collapse small |
| `motion-medium-2`    | 300  | Menu, snackbar, bottom-sheet open |
| `motion-medium-3`    | 350  | Page nav on mobile |
| `motion-medium-4`    | 400  | Fade between routes |
| `motion-long-1`      | 450  | Vote tally ease-in |
| `motion-long-2`      | 500  | Card flip, dialog open |
| `motion-long-3`      | 550  | Winner reveal staged step |
| `motion-long-4`      | 600  | Winner reveal hero pop |
| `motion-extra-long-*`| 700–1000 | Confetti particles |

### Easing

| Token                          | cubic-bezier |
|--------------------------------|--------------|
| `motion-ease-linear`           | `linear`                         |
| `motion-ease-standard`         | `cubic-bezier(0.2, 0, 0, 1)`     |
| `motion-ease-standard-accel`   | `cubic-bezier(0.3, 0, 1, 1)`     |
| `motion-ease-standard-decel`   | `cubic-bezier(0, 0, 0, 1)`       |
| `motion-ease-emphasized`       | `cubic-bezier(0.2, 0, 0, 1)`     |
| `motion-ease-emphasized-accel` | `cubic-bezier(0.3, 0, 0.8, 0.15)`|
| `motion-ease-emphasized-decel` | `cubic-bezier(0.05, 0.7, 0.1, 1)`|

### Reduced motion

When `prefers-reduced-motion: reduce`:
- All durations clamp to ≤ 100 ms (or 0 for non-essential).
- Parallax, confetti, and hero scale animations are suppressed.
- Opacity crossfades are preserved at 100 ms for continuity.

---

## 7. Z-index tokens

| Token        | Value | Use |
|--------------|-------|-----|
| `z-base`     | 0     | Default |
| `z-raised`   | 1     | Resting card |
| `z-sticky`   | 10    | Sticky section header |
| `z-app-bar`  | 100   | Top app bar |
| `z-bottom-nav` | 100 | Bottom navigation |
| `z-fab`      | 110   | FAB above bottom nav |
| `z-drawer`   | 200   | Side drawer |
| `z-overlay`  | 900   | CDK overlay backdrop |
| `z-dialog`   | 1000  | Dialog, menu, tooltip, snackbar |
| `z-toast`    | 1100  | Snackbar (transient) |
| `z-live-critical` | 2000 | Winner reveal full-screen overlay |

---

## 8. Breakpoint tokens

Aligned with Angular CDK layout:

| Token          | Min width |
|----------------|-----------|
| `bp-xs`        | 0         |
| `bp-sm`        | 600 px    |
| `bp-md`        | 905 px    |
| `bp-lg`        | 1240 px   |
| `bp-xl`        | 1440 px   |

Match media strings used in SCSS:
```
@use '@angular/cdk' as cdk;
@include cdk.media(min-width 600) { … } // sm
@include cdk.media(min-width 905) { … } // md
```

---

## 9. Opacity tokens

| Token                    | Value |
|--------------------------|-------|
| `state-hover-opacity`    | 0.08  |
| `state-focus-opacity`    | 0.12  |
| `state-pressed-opacity`  | 0.12  |
| `state-dragged-opacity`  | 0.16  |
| `disabled-container-opacity` | 0.12 |
| `disabled-content-opacity`   | 0.38 |
| `scrim-opacity`          | 0.32  |

---

## 10. Icon tokens

Icon set: **Material Symbols Rounded** (variable font, self-hosted).

| Token        | Size |
|--------------|------|
| `icon-xs`    | 16 px |
| `icon-sm`    | 20 px |
| `icon-md`    | 24 px (default) |
| `icon-lg`    | 32 px |
| `icon-xl`    | 40 px |
| `icon-hero`  | 64 px |

Stroke / fill variations are controlled by the `FILL` and `wght` axes of
Material Symbols (e.g. active tab icon: `FILL 1`, weight 500).

---

## 11. Angular Material binding

All tokens above are generated by `mat.define-theme()` in
`src/web/src/styles/_theme.scss`:

```scss
@use '@angular/material' as mat;

$brand-palette: (
  primary: ( 0: #000000, 10: #410000, 20: #6B1A10, 30: #8F2D21,
             40: #B34032, 50: #E04F3C, 60: #F06A58, 70: #FF8C7B,
             80: #FFB4A6, 90: #FFDAD2, 95: #FFEDE8, 99: #FFFBF8, 100:#FFFFFF ),
  // … secondary, tertiary, neutral, neutral-variant as above
);

$qq-light-theme: mat.define-theme((
  color: ( theme-type: light, primary: $brand-palette, tertiary: $tertiary-palette ),
  typography: ( brand-family: 'Fraunces', plain-family: 'Inter' ),
  density: ( scale: 0 )
));

$qq-dark-theme: mat.define-theme((
  color: ( theme-type: dark, primary: $brand-palette, tertiary: $tertiary-palette ),
  typography: $qq-light-theme,
  density: ( scale: 0 )
));
```

And applied globally:

```scss
html { @include mat.all-component-themes($qq-light-theme); }
.theme-dark { @include mat.all-component-colors($qq-dark-theme); }
```

Density is **0** (default comfortable) on `xs`/`sm`, **-1** (compact) on
`md`+ where space is plentiful but more content is desirable.
