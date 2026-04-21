import { Page, expect } from '@playwright/test';

export class RestaurantProfilePage {
  constructor(private readonly page: Page) {}

  async leaveReview(stars: number, body?: string): Promise<void> {
    await this.page.getByTestId(`star-${stars}`).click();
    if (body) {
      await this.page.getByTestId('review-body-input').fill(body);
    }
    await this.page.getByTestId('submit-review-btn').click();
    await expect(this.page.getByTestId('review-success')).toBeVisible({ timeout: 3000 });
  }

  async expectReviewFormUnavailable(): Promise<void> {
    await expect(this.page.getByTestId('review-unavailable')).toBeVisible();
    await expect(this.page.getByTestId('submit-review-btn')).not.toBeVisible();
  }

  async expectAverageRating(stars: number): Promise<void> {
    await expect(this.page.getByTestId('average-rating')).toBeVisible();
    await expect(this.page.getByTestId('average-rating')).toContainText(`${stars}`);
  }

  async expectReviewCount(n: number): Promise<void> {
    await expect(this.page.getByTestId('review-count')).toBeVisible();
    await expect(this.page.getByTestId('review-count')).toContainText(`${n}`);
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.getByTestId('empty-state')).toBeVisible();
    await expect(this.page.getByTestId('suggest-cta')).toBeVisible();
  }
}
