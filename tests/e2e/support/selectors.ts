export const SELECTORS = {
  APP_SHELL: '[data-testid="app-shell"]',
  NAV_BAR: '[data-testid="nav-bar"]',
  TOAST: '[data-testid="toast"]',
  AUTH: {
    SIGN_IN_FORM: '[data-testid="sign-in-form"]',
    SIGN_UP_FORM: '[data-testid="sign-up-form"]',
    EMAIL_INPUT: '[data-testid="email-input"]',
    PASSWORD_INPUT: '[data-testid="password-input"]',
    SUBMIT_BUTTON: '[data-testid="submit-button"]',
  },
  TEAM: {
    CREATE_FORM: '[data-testid="create-team-form"]',
    NAME_INPUT: '[data-testid="team-name-input"]',
    TEAM_CARD: '[data-testid="team-card"]',
  },
  SESSION: {
    START_BUTTON: '[data-testid="start-session-button"]',
    SESSION_CARD: '[data-testid="session-card"]',
  },
} as const;
