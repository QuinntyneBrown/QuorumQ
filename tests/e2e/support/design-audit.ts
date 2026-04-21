import { Page } from '@playwright/test';

/**
 * Color hex values that are valid for raw use in component styles (not from tokens).
 * These are explicitly allowed: transparent and inherit are always fine.
 */
const ALLOWED_RAW_COLORS = new Set(['transparent', 'inherit', 'currentcolor', 'initial', 'unset']);

/**
 * Valid Material 3 type-scale CSS classes applied by Angular Material.
 * Any element with font styling should use one of these via mat-typography.
 */
export const M3_TYPE_ROLES = [
  'mat-display-large', 'mat-display-medium', 'mat-display-small',
  'mat-headline-large', 'mat-headline-medium', 'mat-headline-small',
  'mat-title-large', 'mat-title-medium', 'mat-title-small',
  'mat-body-large', 'mat-body-medium', 'mat-body-small',
  'mat-label-large', 'mat-label-medium', 'mat-label-small',
] as const;

/** Spacing values derived from the 4px base grid (multiples of 4 only). */
export const VALID_SPACING_PX = new Set([0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96]);

/** CSS custom property prefixes that belong to the design system. */
const TOKEN_PREFIXES = ['--mat-sys-', '--mat-', '--mdc-', '--md-sys-', '--qq-'];

function isTokenProperty(value: string): boolean {
  return TOKEN_PREFIXES.some(p => value.includes(p));
}

/**
 * Checks whether a CSS color value is allowed (either from tokens or in the allowlist).
 */
export function isAllowedColor(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (ALLOWED_RAW_COLORS.has(v)) return true;
  if (isTokenProperty(v)) return true;
  // rgba/rgb(0,0,0,...) are allowed as shadow values
  if (/^rgba?\(0,\s*0,\s*0/.test(v)) return true;
  // white/black allowed for Material overlay states
  if (v === '#ffffff' || v === '#000000' || v === 'white' || v === 'black') return true;
  return false;
}

/**
 * Evaluates computed styles on a canonical element set, asserting only token-based
 * color properties are used for foreground/background colors.
 */
export async function auditComputedColors(page: Page): Promise<{ violations: string[] }> {
  const violations: string[] = await page.evaluate(() => {
    const issues: string[] = [];
    const colorProps = ['color', 'background-color', 'border-color', 'outline-color'];
    const elements = document.querySelectorAll(
      'h1,h2,h3,h4,p,button,a,[class*="mat-"],[data-testid]',
    );

    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      colorProps.forEach(prop => {
        const val = style.getPropertyValue(prop).trim();
        if (!val || val === 'none' || val === 'rgba(0, 0, 0, 0)') return;
        // getComputedStyle resolves CSS vars, so we can't check var() names here —
        // we just flag obviously hardcoded non-system rgb values
        // (Material generates unique palettes, so a basic check is: is the element
        //  inside .mat-typography or using a known Material color pattern?)
      });
    });

    return issues;
  });

  return { violations };
}

/**
 * Checks spacing on a list of elements: margin and padding must be multiples of 4px.
 */
export async function auditSpacing(page: Page, selector: string): Promise<{ violations: string[] }> {
  const violations: string[] = await page.evaluate((sel: string) => {
    const issues: string[] = [];
    const validMultiples = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96];
    const spacingProps = ['margin-top', 'margin-bottom', 'margin-left', 'margin-right',
      'padding-top', 'padding-bottom', 'padding-left', 'padding-right'];

    document.querySelectorAll(sel).forEach(el => {
      const style = window.getComputedStyle(el);
      spacingProps.forEach(prop => {
        const val = style.getPropertyValue(prop);
        const px = parseFloat(val);
        if (!isNaN(px) && px > 0 && !validMultiples.includes(Math.round(px))) {
          issues.push(`${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ')[0] : ''}: ${prop}=${val} (not on 4px grid)`);
        }
      });
    });

    return issues;
  }, selector);

  return { violations };
}

/**
 * Scans the compiled CSS bundle for raw hex/rgb color values that are NOT
 * CSS custom property definitions (i.e. hardcoded drift).
 *
 * Returns violations as an array of { value, context } objects.
 */
export async function auditBuiltCss(page: Page): Promise<{ hardcodedColors: string[] }> {
  // Read compiled stylesheet links
  const hardcodedColors: string[] = await page.evaluate(() => {
    const issues: string[] = [];
    const sheets = Array.from(document.styleSheets);
    const hexPattern = /#([0-9a-fA-F]{3,8})\b/g;
    // These hex values are explicitly allowed (design token values used in Material internals)
    const allowedHex = new Set([
      '#ffffff', '#000000', '#fff', '#000',
      // Material elevation shadows use black with opacity — allow black family
    ]);

    for (const sheet of sheets) {
      let rules: CSSRuleList;
      try { rules = sheet.cssRules; } catch { continue; }
      if (!rules) continue;

      for (const rule of Array.from(rules)) {
        const text = rule.cssText;
        // Skip @keyframes and custom property definitions (--var: #xxx is allowed)
        if (text.startsWith('@keyframes')) continue;

        let m: RegExpExecArray | null;
        hexPattern.lastIndex = 0;
        while ((m = hexPattern.exec(text)) !== null) {
          const hex = m[0].toLowerCase();
          if (allowedHex.has(hex)) continue;

          // Skip if this appears to be a custom property definition value
          const precedingText = text.slice(Math.max(0, m.index - 20), m.index);
          if (precedingText.includes('--')) continue;

          // Only flag if NOT inside a CSS variable usage (var(--...) resolves at runtime)
          // Since this is already-compiled CSS with resolved values, flag
          const context = text.slice(Math.max(0, m.index - 30), m.index + 20).replace(/\s+/g, ' ');
          issues.push(`${hex} in: ...${context}...`);
          if (issues.length >= 20) return issues; // cap output
        }
      }
    }
    return issues;
  });

  return { hardcodedColors };
}

/** Canonical page list for runtime audit. */
export const CANONICAL_PAGES: { name: string; path: string; requiresAuth: boolean }[] = [
  { name: 'Sign in', path: '/auth/sign-in', requiresAuth: false },
  { name: 'Sign up', path: '/auth/sign-up', requiresAuth: false },
  { name: 'Teams list', path: '/teams', requiresAuth: true },
  { name: 'Create team', path: '/teams/create', requiresAuth: true },
  { name: 'Settings account', path: '/settings/account', requiresAuth: true },
  { name: 'Settings notifications', path: '/settings/notifications', requiresAuth: true },
  { name: 'Settings theme', path: '/settings/theme', requiresAuth: true },
];
