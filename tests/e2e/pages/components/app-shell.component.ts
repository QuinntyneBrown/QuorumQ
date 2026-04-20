import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class AppShellComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}
