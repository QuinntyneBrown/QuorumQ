# 16 · Icons & Imagery

**Traces to:** L2-24, L2-27

Visual assets in QuorumQ are kept deliberately small: one icon font
(variable), generated avatars, and a handful of simple illustrations for
empty/error states.

---

## 1. Icon system

- **Family**: [Material Symbols Rounded](https://fonts.google.com/icons),
  variable font axes `FILL`, `wght`, `GRAD`, `opsz`.
- **Hosting**: self-hosted WOFF2 subset (only icons actually used),
  generated at build time via a tiny script that reads `*.html` for
  `<mat-icon>` usage.
- **Default weight**: 400. Active bottom-nav / selected chip: 500. Filled
  variants (`FILL=1`) for active states only.
- **Default size**: `icon-md` (24). Use tokens from `01-design-tokens.md §10`.

### 1.1 Icon inventory

| Where                          | Icon name                  |
|--------------------------------|----------------------------|
| App mark (favicon, hero)       | `restaurant` (custom mono) |
| Top app bar menu               | `menu`                     |
| Back                           | `arrow_back`               |
| Close                          | `close`                    |
| Overflow                       | `more_vert`                |
| Notifications bell             | `notifications`            |
| Settings                       | `settings`                 |
| Home (bottom nav)              | `home`                     |
| Lunch (bottom nav)             | `restaurant`               |
| History (bottom nav)           | `history`                  |
| Team (bottom nav)              | `groups`                   |
| Search / autocomplete          | `search`                   |
| Add / create                   | `add`                      |
| Vote action                    | `how_to_vote`              |
| Voted (check)                  | `check`                    |
| Comments                       | `chat_bubble`              |
| Copy                           | `content_copy`             |
| Share                          | `ios_share`                |
| Theme system                   | `brightness_auto`          |
| Theme light                    | `light_mode`               |
| Theme dark                     | `dark_mode`                |
| Online indicator               | `circle` (filled, `icon-xs`) |
| Winner / trophy                | `emoji_events`             |
| Tie / dice                     | `casino`                   |
| Directions                     | `directions`               |
| Website                        | `public`                   |
| Phone                          | `call`                     |
| Reviews / star                 | `star`, `star_outline`     |
| Verify / check-circle          | `check_circle`             |
| Error / warning                | `warning`                  |
| Locked                         | `lock`                     |
| Offline / no signal            | `signal_disconnected`      |
| Reconnecting (animated)        | `autorenew`                |
| Download (export)              | `download`                 |
| Edit                           | `edit`                     |
| Delete                         | `delete`                   |
| Visibility                     | `visibility` / `visibility_off` |

### 1.2 Icon color rules

Icons always inherit `currentColor` from their container. Therefore:

- An icon inside a filled primary button is `on-primary`.
- An icon inside a secondary-container chip is `on-secondary-container`.
- A standalone `mat-icon` in a list takes `on-surface-variant`.

---

## 2. Avatars

- **Shape**: `radius-full`.
- **Sizes** (see `03-components.md §14`).
- **Source**:
  - If the user has uploaded a photo → display it with `object-fit: cover`.
  - Else, generate an initial avatar: take the first letter(s) of the name
    on a tonal background derived from a stable hash of the user id.
  - Hashing maps the id to one of 6 tonal pairs:

```
  1  primary-container / on-primary-container
  2  secondary-container / on-secondary-container
  3  tertiary-container / on-tertiary-container
  4  surface-container-high / on-surface
  5  error-container / on-error-container
  6  inverse-surface / inverse-on-surface
```

- **Presence dot** (L2-20): 10 px dot bottom-right, 2 px ring in the
  avatar's parent surface color.

### 2.1 Avatar examples

```
 photo         initials       presence
 ┌─────┐       ┌─────┐        ┌─────┐
 │ 👤  │       │  PP │        │ 👤  │●
 └─────┘       └─────┘        └─────┘
 40 × 40       40 × 40        40 × 40 with 10 px dot
 radius-full   tertiary       online : secondary
                              offline: outline
```

---

## 3. Illustrations

Used only for empty, error, and onboarding states. The app stays icon-led —
illustrations are deliberately simple to reduce weight and to keep the
feeling focused on the team, not the brand.

- **Format**: inline SVG, single-color strokes using `currentColor` so they
  tint with the theme.
- **Style**: rounded, hand-drawn feel at 1.5 px stroke (scales with
  viewport), no gradients, no characters. Icons-as-illustration at
  `icon-hero` (64 px) work for most states; a handful of larger 160 × 160
  SVGs are included for the marquee empty states.

### 3.1 Illustration catalog

| State / screen                  | Asset (SVG)                          | Color       |
|--------------------------------|---------------------------------------|-------------|
| Landing hero                    | `plate-fork-knife` (160)              | `tertiary`  |
| No teams                        | `plate-question` (160)                | `tertiary`  |
| No active lunch                 | `clock-spoon` (160)                   | `secondary` |
| No suggestions                  | `pencil-plate` (icon-hero)            | `secondary` |
| No votes                        | `ballot` (icon-hero)                  | `primary`   |
| No history                      | `clock-back` (icon-hero)              | `outline`   |
| No reviews                      | `sprout` (icon-hero)                  | `secondary` |
| 403                             | `lock` (icon-hero)                    | `outline`   |
| 404                             | `empty-plate` (160)                   | `outline`   |
| 500                             | `broken-fork` (icon-hero)             | `error`     |
| Maintenance                     | `wrench-stove` (160)                  | `tertiary`  |
| Offline                         | `signal-off` (icon-hero)              | `outline`   |
| Account deleted confirmation    | `check-circle` (icon-hero)            | `tertiary`  |
| Winner reveal                   | `trophy` (hero element)               | `tertiary`  |

### 3.2 Accessibility

- Each illustration is either decorative (wrapped in `aria-hidden="true"`
  when a nearby heading describes the state) or has
  `role="img" aria-label="…"`.
- Never relies on color alone to communicate — the paired heading and
  description always cover meaning.

---

## 4. Restaurant hero imagery

The restaurant profile hero is a **photo when available** (uploaded or
auto-suggested by the team), otherwise a **cuisine-icon tile**:

```
photo hero                       icon tile hero
┌───────────────────────────┐   ┌───────────────────────────┐
│   ░░░░░░░░░░░░░░░░░░░░░░ │   │                           │
│   ░░░░░░░░░░░░░░░░░░░░░░ │   │           🌮              │   primary-container bg
│   ░░░░░░░░░░░░░░░░░░░░░░ │   │                           │   icon 96 px, on-primary-container
└───────────────────────────┘   └───────────────────────────┘
16:9 aspect, radius-md          1:1 aspect square
```

Photos use `loading="lazy"`, a color-dominant placeholder while loading,
and a subtle gradient (0 → 24 % bottom scrim) to ensure the title is
readable if it overlaps.

---

## 5. Brand mark

- Wordmark "QuorumQ" in **Fraunces**, weight 500, optical size 36.
- Accompanied by a simple plate-fork glyph in `tertiary` at 0.8 × cap
  height.
- App icon (PWA / favicons): plate-fork glyph on `primary-container`
  square, 48 / 192 / 512 px.

---

## 6. Assets directory structure

```
src/web/src/assets/
  icons/
    material-symbols-rounded-subset.woff2      // self-hosted font
  illustrations/
    empty-teams.svg
    empty-lunch.svg
    error-500.svg
    error-403.svg
    error-404.svg
    offline.svg
    winner-trophy.svg
    ...
  brand/
    mark.svg
    wordmark.svg
    app-icon-192.png
    app-icon-512.png
```

Every SVG is optimized with SVGO and ships without metadata. Total asset
budget < 60 KB.
