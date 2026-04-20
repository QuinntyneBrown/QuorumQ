import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BreakpointObserver } from '@angular/cdk/layout';

export function provideQuorumMaterialTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAnimationsAsync(),
    BreakpointObserver,
  ]);
}
