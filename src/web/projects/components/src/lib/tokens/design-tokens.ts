export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
  12: 96,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 28,
  full: 9999,
} as const;

export const motion = {
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
    extraLong1: 700,
    extraLong2: 800,
    extraLong3: 900,
    extraLong4: 1000,
  },
  easing: {
    linear: 'linear',
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    standardAccel: 'cubic-bezier(0.3, 0, 1, 1)',
    standardDecel: 'cubic-bezier(0, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedAccel: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    emphasizedDecel: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  },
} as const;

export const zIndex = {
  base: 0,
  raised: 1,
  sticky: 10,
  appBar: 100,
  bottomNav: 100,
  fab: 110,
  drawer: 200,
  overlay: 900,
  dialog: 1000,
  toast: 1100,
  liveCritical: 2000,
} as const;

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 905,
  lg: 1240,
  xl: 1440,
} as const;

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  hero: 64,
} as const;

export const opacity = {
  stateHover: 0.08,
  stateFocus: 0.12,
  statePressed: 0.12,
  stateDragged: 0.16,
  disabledContainer: 0.12,
  disabledContent: 0.38,
  scrim: 0.32,
} as const;
