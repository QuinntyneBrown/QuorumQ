import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AvatarComponent, CardComponent, EmptyStateComponent } from '@components';
import { environment } from '../../../environments/environment';

interface ReviewAuthor {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

interface ReviewDto {
  id: string;
  rating: number;
  body?: string;
  author: ReviewAuthor;
  createdAt: string;
  updatedAt?: string;
}

interface RestaurantDetail {
  id: string;
  name: string;
  cuisine?: string;
  address?: string;
  websiteUrl?: string;
  averageRating?: number;
  reviewCount: number;
  reviews: ReviewDto[];
}

@Component({
  selector: 'app-restaurant-profile-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, MatButtonModule, MatIconModule, AvatarComponent, CardComponent, EmptyStateComponent],
  template: `
    <div class="profile-shell" data-testid="restaurant-profile">
      @if (restaurant()) {
        <header class="profile-header">
          <h1 class="name" data-testid="restaurant-name">{{ restaurant()!.name }}</h1>
          @if (restaurant()!.cuisine) {
            <p class="cuisine" data-testid="restaurant-cuisine">{{ restaurant()!.cuisine }}</p>
          }
          @if (restaurant()!.address) {
            <p class="address" data-testid="restaurant-address">{{ restaurant()!.address }}</p>
          }
          @if (restaurant()!.websiteUrl) {
            <a [href]="restaurant()!.websiteUrl" target="_blank" rel="noopener" class="website" data-testid="restaurant-website">
              {{ restaurant()!.websiteUrl }}
            </a>
          }
          @if (restaurant()!.averageRating != null) {
            <div class="rating" data-testid="average-rating">
              <mat-icon class="star-icon">star</mat-icon>
              <span class="rating-value">{{ restaurant()!.averageRating | number:'1.1-1' }}</span>
              <span class="review-count" data-testid="review-count">({{ restaurant()!.reviewCount }} review{{ restaurant()!.reviewCount === 1 ? '' : 's' }})</span>
            </div>
          }
        </header>

        @if (restaurant()!.reviews.length === 0) {
          <qq-empty-state
            title="No reviews yet"
            description="Pick this restaurant for lunch and be the first to review it!"
            data-testid="empty-state"
          >
            <a slot="cta" mat-flat-button color="primary"
              [routerLink]="['/teams', teamId(), 'sessions', 'new']"
              data-testid="suggest-cta">
              Suggest next lunch
            </a>
          </qq-empty-state>
        } @else {
          <section class="reviews-section">
            <h2 class="reviews-title">Reviews ({{ restaurant()!.reviewCount }})</h2>
            <ul class="reviews-list" data-testid="reviews-list">
              @for (r of restaurant()!.reviews; track r.id) {
                <li class="review-item" [attr.data-testid]="'review-' + r.id">
                  <qq-card appearance="outlined">
                    <div class="review-body">
                      <div class="review-header">
                        <qq-avatar [name]="r.author.displayName" size="sm" />
                        <span class="author-name">{{ r.author.displayName }}</span>
                        <span class="stars" [attr.aria-label]="r.rating + ' stars'">
                          @for (i of starRange(r.rating); track i) {
                            <mat-icon class="star-icon filled">star</mat-icon>
                          }
                          @for (i of starRange(5 - r.rating); track i) {
                            <mat-icon class="star-icon">star_border</mat-icon>
                          }
                        </span>
                        <time class="date" [dateTime]="r.createdAt" [attr.data-testid]="'review-date-' + r.id">
                          {{ r.createdAt | date:'mediumDate' }}
                        </time>
                      </div>
                      @if (r.body) {
                        <p class="review-text">{{ r.body }}</p>
                      }
                    </div>
                  </qq-card>
                </li>
              }
            </ul>
          </section>
        }
      } @else if (notFound()) {
        <p data-testid="not-found">Restaurant not found.</p>
      } @else {
        <p>Loading…</p>
      }
    </div>
  `,
  styles: [`
    .profile-shell { padding: 24px; max-width: 700px; margin: 0 auto; }
    .profile-header { margin-bottom: 24px; }
    .name { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
    .cuisine { color: var(--mat-sys-on-surface-variant); font-size: 15px; margin: 0 0 4px; }
    .address { font-size: 14px; color: var(--mat-sys-on-surface-variant); margin: 0 0 4px; }
    .website { font-size: 14px; color: var(--mat-sys-primary); display: block; margin-bottom: 8px; }
    .rating { display: flex; align-items: center; gap: 4px; margin-top: 8px; }
    .star-icon { font-size: 18px; width: 18px; height: 18px; color: var(--mat-sys-tertiary); }
    .star-icon.filled { color: var(--mat-sys-tertiary); }
    .rating-value { font-size: 16px; font-weight: 600; }
    .review-count { font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .reviews-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .reviews-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .review-body { padding: 12px 16px; }
    .review-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
    .author-name { font-weight: 500; font-size: 14px; }
    .stars { display: flex; gap: 1px; margin-left: auto; }
    .date { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .review-text { font-size: 14px; margin: 0; white-space: pre-wrap; }
  `],
})
export class RestaurantProfilePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  readonly restaurant = signal<RestaurantDetail | null>(null);
  readonly notFound = signal(false);
  readonly teamId = signal('');

  ngOnInit(): void {
    const teamId = this.route.snapshot.paramMap.get('teamId') ?? '';
    const restaurantId = this.route.snapshot.paramMap.get('restaurantId') ?? '';
    this.teamId.set(teamId);
    this.loadProfile(teamId, restaurantId);
  }

  starRange(n: number): number[] {
    return Array.from({ length: Math.max(0, n) }, (_, i) => i);
  }

  private loadProfile(teamId: string, restaurantId: string): void {
    this.http
      .get<RestaurantDetail>(`${environment.apiBaseUrl}/teams/${teamId}/restaurants/${restaurantId}`)
      .subscribe({
        next: r => this.restaurant.set(r),
        error: err => { if (err.status === 404) this.notFound.set(true); },
      });
  }
}
