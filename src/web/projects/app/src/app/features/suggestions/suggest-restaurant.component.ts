import { Component, inject, Input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { environment } from '../../../environments/environment';

export interface SuggestionDto {
  id: string;
  sessionId: string;
  restaurantId: string;
  restaurantName: string;
  cuisine: string | null;
  address: string | null;
  websiteUrl: string | null;
  suggestedBy: string;
  suggestedByName: string;
  createdAt: string;
  voteCount: number;
}

@Component({
  selector: 'app-suggest-restaurant',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatExpansionModule],
  template: `
    <mat-expansion-panel data-testid="suggest-panel" [expanded]="disabled ? false : undefined">
      <mat-expansion-panel-header>
        <mat-panel-title>Suggest a restaurant</mat-panel-title>
      </mat-expansion-panel-header>

      @if (disabled) {
        <p class="disabled-msg" data-testid="form-disabled-msg">
          Suggestions are only accepted during the Suggesting phase.
        </p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" data-testid="suggest-form">
          @if (duplicateMsg()) {
            <div class="duplicate-banner" data-testid="duplicate-banner" role="alert">
              Already suggested by {{ duplicateMsg() }}
              <button type="button" mat-stroked-button (click)="clearDuplicate()" class="upvote-cta" data-testid="upvote-cta">
                Upvote
              </button>
            </div>
          }
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Restaurant name</mat-label>
            <input matInput formControlName="name" data-testid="name-input" autocomplete="off" />
            @if (form.controls.name.hasError('required') && form.controls.name.touched) {
              <mat-error>Name is required</mat-error>
            }
            @if (form.controls.name.hasError('minlength') && form.controls.name.touched) {
              <mat-error>Name must be at least 2 characters</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cuisine (optional)</mat-label>
            <input matInput formControlName="cuisine" data-testid="cuisine-input" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address (optional)</mat-label>
            <input matInput formControlName="address" data-testid="address-input" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Website URL (optional)</mat-label>
            <input matInput formControlName="websiteUrl" data-testid="website-input" type="url" />
          </mat-form-field>
          <div class="actions">
            <button
              mat-flat-button
              color="primary"
              type="submit"
              data-testid="submit-suggestion-btn"
              [disabled]="form.invalid || submitting()"
            >
              Suggest
            </button>
          </div>
        </form>
      }
    </mat-expansion-panel>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    .actions { display: flex; justify-content: flex-end; padding-top: 4px; }
    .duplicate-banner {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      padding: 8px 12px; border-radius: 8px; margin-bottom: 12px;
      font-size: 14px;
    }
    .upvote-cta { margin-left: 12px; }
    .disabled-msg { color: var(--mat-sys-on-surface-variant); font-size: 14px; }
  `],
})
export class SuggestRestaurantComponent {
  @Input({ required: true }) sessionId!: string;
  @Input() disabled = false;

  readonly suggested = output<SuggestionDto>();

  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly duplicateMsg = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    cuisine: [''],
    address: [''],
    websiteUrl: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.duplicateMsg.set(null);

    const { name, cuisine, address, websiteUrl } = this.form.value;
    this.http
      .post<SuggestionDto>(`${environment.apiBaseUrl}/sessions/${this.sessionId}/suggestions`, {
        name, cuisine, address, websiteUrl,
      })
      .subscribe({
        next: dto => {
          this.suggested.emit(dto);
          this.form.reset();
          this.submitting.set(false);
        },
        error: err => {
          if (err.status === 409 && err.error?.existingSuggestion) {
            this.duplicateMsg.set(err.error.suggestedBy);
          }
          this.submitting.set(false);
        },
      });
  }

  clearDuplicate(): void {
    this.duplicateMsg.set(null);
  }
}
