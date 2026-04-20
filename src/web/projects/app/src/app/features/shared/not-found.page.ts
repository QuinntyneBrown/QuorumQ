import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="not-found">
      <span class="not-found__code">404</span>
      <h1 class="not-found__heading">Page not found</h1>
      <p class="not-found__body">The page you're looking for doesn't exist.</p>
      <a mat-flat-button color="primary" routerLink="/teams">Go home</a>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 12px;
      text-align: center;
    }
    .not-found__code {
      font-size: 6rem;
      font-weight: 700;
      line-height: 1;
      opacity: 0.15;
    }
    .not-found__heading {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }
    .not-found__body {
      margin: 0 0 16px;
      opacity: 0.6;
    }
  `],
})
export class NotFoundPageComponent {}
