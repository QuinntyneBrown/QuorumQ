import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../environments/environment';

interface ReviewDto {
  id: string;
  rating: number;
  body?: string;
}

interface MyReviewState {
  participated: boolean;
  review?: ReviewDto;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatTooltipModule],
  template: `
    <div class="review-form" data-testid="review-form">
      @if (!participated()) {
        <p class="unavailable"
          data-testid="review-unavailable"
          matTooltip="Only participants can review">
          Only participants can review this restaurant.
        </p>
      } @else {
        <h4 class="form-title">Rate this restaurant</h4>

        <div class="stars"
          role="radiogroup"
          aria-label="Star rating"
          (keydown)="onKeyDown($event)"
          tabindex="0">
          @for (star of stars; track star) {
            <button
              type="button"
              mat-icon-button
              class="star-btn"
              [class.filled]="star <= (hoveredRating() || rating())"
              [attr.data-testid]="'star-' + star"
              [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')"
              [attr.aria-pressed]="rating() === star"
              (mouseenter)="hoveredRating.set(star)"
              (mouseleave)="hoveredRating.set(0)"
              (click)="rating.set(star)">
              <mat-icon>{{ star <= (hoveredRating() || rating()) ? 'star' : 'star_border' }}</mat-icon>
            </button>
          }
        </div>

        <mat-form-field appearance="outline" class="body-field">
          <mat-label>Written review (optional)</mat-label>
          <textarea matInput
            [(ngModel)]="body"
            maxlength="1000"
            rows="3"
            data-testid="review-body-input"
            aria-label="Written review (optional)"></textarea>
          <mat-hint align="end">{{ body.length }}/1000</mat-hint>
        </mat-form-field>

        <button mat-flat-button color="primary"
          [disabled]="rating() === 0"
          data-testid="submit-review-btn"
          (click)="submitReview()">
          {{ existingReviewId() ? 'Update review' : 'Submit review' }}
        </button>

        @if (submitted()) {
          <p class="success" data-testid="review-success" role="status">
            {{ existingReviewId() ? 'Review updated!' : 'Review submitted!' }}
          </p>
        }

        @if (averageRating()) {
          <p class="avg-rating" data-testid="average-rating">
            Average: {{ averageRating() | number:'1.1-1' }} ★
          </p>
        }
      }
    </div>
  `,
  styles: [`
    .review-form { display: flex; flex-direction: column; gap: 12px; padding: 16px 0; }
    .form-title { margin: 0; font-size: 14px; font-weight: 500; }
    .stars { display: flex; gap: 2px; }
    .star-btn { color: var(--mat-sys-tertiary); }
    .star-btn.filled mat-icon { color: var(--mat-sys-tertiary); }
    .body-field { width: 100%; }
    .unavailable { font-size: 13px; color: var(--mat-sys-on-surface-variant); font-style: italic; margin: 0; }
    .success { font-size: 13px; color: var(--mat-sys-primary); margin: 0; }
    .avg-rating { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin: 0; }
  `],
})
export class ReviewFormComponent implements OnInit {
  @Input({ required: true }) sessionId!: string;

  private readonly http = inject(HttpClient);

  readonly stars = [1, 2, 3, 4, 5];
  readonly rating = signal(0);
  readonly hoveredRating = signal(0);
  readonly participated = signal(false);
  readonly existingReviewId = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly averageRating = signal<number | null>(null);
  body = '';

  ngOnInit(): void {
    this.http
      .get<MyReviewState>(`${environment.apiBaseUrl}/sessions/${this.sessionId}/review`)
      .subscribe({
        next: state => {
          this.participated.set(state.participated);
          if (state.review) {
            this.existingReviewId.set(state.review.id);
            this.rating.set(state.review.rating);
            this.body = state.review.body ?? '';
          }
        },
        error: () => {},
      });
  }

  onKeyDown(event: KeyboardEvent): void {
    const current = this.rating();
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.rating.set(Math.min(5, current + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.rating.set(Math.max(1, current - 1));
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (current > 0) this.submitReview();
    }
  }

  submitReview(): void {
    const r = this.rating();
    if (r < 1) return;
    this.http
      .put<{ review: ReviewDto; averageRating: number }>(
        `${environment.apiBaseUrl}/sessions/${this.sessionId}/review`,
        { rating: r, body: this.body || null }
      )
      .subscribe({
        next: res => {
          this.existingReviewId.set(res.review.id);
          this.averageRating.set(res.averageRating);
          this.submitted.set(true);
        },
        error: () => {},
      });
  }
}
