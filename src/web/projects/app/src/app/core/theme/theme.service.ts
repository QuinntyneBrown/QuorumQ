import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type ThemeChoice = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly http = inject(HttpClient);

  readonly theme = signal<ThemeChoice>('system');

  constructor() {
    effect(() => this.applyTheme(this.theme()));
  }

  init(preference: ThemeChoice): void {
    this.theme.set(preference);
  }

  setTheme(choice: ThemeChoice): void {
    this.theme.set(choice);
    this.http
      .put(`${environment.apiBaseUrl}/auth/me/preferences`, { theme: choice })
      .subscribe();
  }

  private applyTheme(choice: ThemeChoice): void {
    const html = document.documentElement;
    const isDark =
      choice === 'dark' ||
      (choice === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    html.classList.toggle('theme-dark', isDark);
  }
}
