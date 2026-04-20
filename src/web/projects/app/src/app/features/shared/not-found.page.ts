import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { EmptyStateComponent } from '@components';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <qq-empty-state title="Page not found" description="The page you're looking for doesn't exist.">
      <span slot="illustration">🔍</span>
      <a mat-filled-button routerLink="/" slot="cta">Go home</a>
    </qq-empty-state>
  `,
})
export class NotFoundPage {}
