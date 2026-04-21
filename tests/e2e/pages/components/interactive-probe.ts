import { Locator, Page, expect } from '@playwright/test';

export const MIN_TOUCH_PX = 44;

export async function assertMinTouchTarget(
  locator: Locator,
  label: string,
  min = MIN_TOUCH_PX,
): Promise<void> {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label}: not in DOM`).not.toBeNull();
  expect(box!.width, `${label}: width ${box!.width}px < ${min}px`).toBeGreaterThanOrEqual(min);
  expect(box!.height, `${label}: height ${box!.height}px < ${min}px`).toBeGreaterThanOrEqual(min);
}

/**
 * Verifies an element is keyboard-accessible:
 *  1. Not explicitly removed from the Tab order (tabindex !== "-1" and not disabled).
 *  2. Can receive keyboard focus.
 *  3. Shows a visible :focus-visible ring (the global rule in styles.scss sets
 *     outline: 3px solid primary when keyboard-navigation mode is active).
 */
export async function assertKeyboardAccessible(
  page: Page,
  locator: Locator,
  label: string,
): Promise<void> {
  // Check element is not explicitly excluded from the Tab order.
  const tabindex = await locator.getAttribute('tabindex');
  expect(tabindex, `${label}: tabindex="-1" removes it from Tab order`).not.toBe('-1');
  expect(await locator.isDisabled(), `${label}: element is disabled`).toBe(false);

  // Press Tab once to activate the browser's "keyboard navigation" mode, then
  // focus the element directly. Chrome/Firefox honour :focus-visible for
  // subsequent programmatic .focus() calls once keyboard mode is active.
  await page.keyboard.press('Tab');
  await locator.focus();
  await expect(locator).toBeFocused();

  // :focus-visible rule: outline-width must be > 0.
  const outlinePx = await page.evaluate(
    () => parseFloat(window.getComputedStyle(document.activeElement as Element).outlineWidth),
  );
  expect(outlinePx, `${label}: no visible focus ring`).toBeGreaterThan(0);
}

/**
 * Verifies a mat-tab-nav-bar tab is reachable via ArrowRight (roving tabindex
 * means inactive tabs have tabindex="-1" but are Arrow-reachable) and shows a
 * visible focus ring.
 */
export async function assertArrowTabReachable(
  page: Page,
  locator: Locator,
  label: string,
): Promise<void> {
  await page.keyboard.press('ArrowRight');
  await expect(locator).toBeFocused();

  const outlinePx = await page.evaluate(
    () => parseFloat(window.getComputedStyle(document.activeElement as Element).outlineWidth),
  );
  expect(outlinePx, `${label}: no visible focus ring`).toBeGreaterThan(0);
}
