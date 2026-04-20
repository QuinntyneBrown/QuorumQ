import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { environment } from '../../../environments/environment';

interface SessionDetail {
  id: string;
  teamId: string;
  state: string;
  deadline: string;
  startedAt: string;
  suggestionCount: number;
  winnerName?: string;
}

@Component({
  selector: 'app-start-session-page',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatSliderModule, MatFormFieldModule],
  template: `
    <div class="page-shell">
      <h1 class="mat-headline-small">Start lunch session</h1>
      <p class="helper">Choose how long the team has to submit and vote on suggestions.</p>

      <div class="slider-section">
        <label class="mat-body-medium" for="deadline-slider">
          Voting deadline: <strong>{{ deadlineMinutes() }} min</strong>
        </label>
        <mat-slider
          id="deadline-slider"
          min="5"
          max="180"
          step="5"
          discrete
          [displayWith]="formatLabel"
          data-testid="deadline-slider"
        >
          <input
            matSliderThumb
            [ngModel]="deadlineMinutes()"
            (ngModelChange)="deadlineMinutes.set($event)"
            data-testid="deadline-input"
          />
        </mat-slider>
        <p class="deadline-hint mat-body-small" data-testid="deadline-hint">
          Session ends at {{ absoluteDeadline() }}
        </p>
      </div>

      @if (error()) {
        <p class="error-msg mat-body-small" data-testid="start-error">{{ error() }}</p>
      }

      <div class="actions">
        <button
          mat-flat-button
          color="primary"
          [disabled]="submitting()"
          (click)="startLunch()"
          data-testid="start-lunch-btn"
        >
          Start lunch
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-shell { padding: 24px; max-width: 480px; margin: 0 auto; }
    h1 { margin: 0 0 8px; }
    .helper { color: var(--mat-sys-on-surface-variant); margin-bottom: 32px; }
    .slider-section { display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }
    mat-slider { width: 100%; }
    .deadline-hint { color: var(--mat-sys-on-surface-variant); margin: 0; }
    .error-msg { color: var(--mat-sys-error); margin-bottom: 16px; }
    .actions { display: flex; gap: 12px; }
  `],
})
export class StartSessionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly deadlineMinutes = signal(45);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly teamId = signal('');

  readonly absoluteDeadline = computed(() => {
    const d = new Date(Date.now() + this.deadlineMinutes() * 60 * 1000);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  });

  ngOnInit(): void {
    this.teamId.set(this.route.snapshot.paramMap.get('teamId') ?? '');
  }

  formatLabel(value: number): string {
    return `${value}m`;
  }

  startLunch(): void {
    this.submitting.set(true);
    this.error.set('');
    this.http
      .post<SessionDetail>(
        `${environment.apiBaseUrl}/teams/${this.teamId()}/sessions`,
        { deadlineMinutes: this.deadlineMinutes() },
        { observe: 'response' },
      )
      .subscribe({
        next: res => {
          const session = res.body!;
          this.router.navigate(['/teams', this.teamId(), 'sessions', session.id]);
        },
        error: err => {
          this.submitting.set(false);
          const detail = err?.error?.errors?.deadlineMinutes?.[0];
          this.error.set(detail ?? 'Could not start session. Please try again.');
        },
      });
  }
}
