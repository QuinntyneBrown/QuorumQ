import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BreakpointObserver } from '@angular/cdk/layout';
import { breakpoints } from '../tokens/design-tokens';

export function provideQuorumMaterialTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAnimationsAsync(),
    BreakpointObserver,
  ]);
}

export const BREAKPOINTS = {
  xs: `(max-width: ${breakpoints.sm - 1}px)`,
  sm: `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  md: `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  lg: `(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
} as const;
