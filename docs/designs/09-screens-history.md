# 09 · History Screens

**Traces to:** L2-37, L2-38

---

## 1. History list (L2-37)

Reached from bottom-nav (mobile) / rail (desktop). Mobile:

```
┌───────────────────────────────────┐
│  ☰  History · Team Tacos  🔽  ⋮   │   🔽 filter, ⋮ export menu
├───────────────────────────────────┤
│  [ All ][ Decided ][ Cancelled ]  │   filter chips, selected = secondary-container
│                                   │
│  April 2026                       │   section header, label-large
│  ┌─────────────────────────────┐  │
│  │ 🏆 Taco Town                │  │
│  │ Wed Apr 17 · 5-2-1-0        │  │   vote tally compacted
│  │ 8 / 9 members participated  │  │
│  └─────────────────────────────┘  │
│  ┌─────────────────────────────┐  │
│  │ 🏆 Pho Forever              │  │
│  │ Tue Apr 16 · 6-3-1          │  │
│  │ 10 / 10 members             │  │
│  └─────────────────────────────┘  │
│                                   │
│  March 2026                       │
│  ┌─────────────────────────────┐  │
│  │ ✕ Cancelled                 │  │
│  │ Fri Mar 28 · Priya stopped  │  │   no winner, outline chip
│  └─────────────────────────────┘  │
│  ...                              │
├───────────────────────────────────┤
│  🏠   🍽   🕓●  👥                │
└───────────────────────────────────┘
```

Empty state (L2-37 implied empty):

```
┌───────────────────────────────────┐
│                                   │
│             🕓                     │
│                                   │
│   No lunches yet                  │   headline-small
│   Your team's past decisions     │   body-medium (muted)
│   will appear here.               │
│                                   │
│  ┌───────────────────────────────┐│
│  │        Start a lunch          ││
│  └───────────────────────────────┘│
└───────────────────────────────────┘
```

---

## 2. Filter

Filter chip row is a `mat-chip-set` with `cdkScrollable` overflow. Tapping
multiple chips adds to the filter; tapping "All" resets.

---

## 3. Past session detail (L2-37 AC 2)

```
┌───────────────────────────────────┐
│  ←  Wed Apr 17 · Lunch            │
├───────────────────────────────────┤
│  [ Decided ]                      │
│                                   │
│  🏆 Winner: Taco Town             │   title-large, tertiary
│  5 votes · 23 min to decide       │   body-medium
│                                   │
│  ───────────────────────────────  │
│  Final tally                      │   title-medium
│  🌮 Taco Town      ██████ 5       │   horizontal bars, tertiary for winner,
│  🍜 Pho Forever    ██ 2           │   outline for rest
│  🥗 Green Bowl     █ 1            │
│  🍛 Curry House     0             │
│                                   │
│  ───────────────────────────────  │
│  Participants · 8 / 9             │   title-medium
│  👤 👤 👤 👤 👤 👤 👤 👤            │   avatar row, 32 px
│  Missing: Dana                    │   body-small (muted)
│                                   │
│  ───────────────────────────────  │
│  Comments (6)                     │   read-only thread
│  ...                              │
└───────────────────────────────────┘
```

Everything is read-only — no vote, suggest, or comment actions are present.

---

## 4. Export CSV (L2-38)

Accessed from the history overflow ⋮ menu:

```
  ┌─────────────────────────────┐
  │  Export CSV                 │
  │  Filter…                    │
  └─────────────────────────────┘
```

Export dialog:

```
┌─────────────────────────────────────────┐
│  Export history                         │
│  ─────────────────────────              │
│                                         │
│  Range                                  │
│  [ All time ] [ Last 30 days ] [ Custom ]
│                                         │
│  Include                                │
│  ☑ Winner                               │
│  ☑ Vote tally                           │
│  ☑ Participants                         │
│  ☐ Comments                             │
│                                         │
│                  Cancel       Export    │
└─────────────────────────────────────────┘
```

Submit triggers a download of `teamtacos-history-YYYYMMDD.csv` and shows
a snackbar "Export downloaded". Visible only to team owner (L2-38 AC 1).

CSV columns: `date, winner, cuisine, tally, participants, participant_names`
as a semicolon-joined list. Optional `comments` column included if selected.

---

## 5. Angular Material components used

- `mat-toolbar`, `mat-list`, `mat-card`
- `mat-chip-set` (filters)
- `mat-menu`, `mat-dialog`, `mat-button-toggle-group` (range picker)
- `mat-snack-bar`
- `mat-progress-bar` (bars in tally list are styled progress-bars with
  `mode="determinate"`, `value` = votes/total × 100)
