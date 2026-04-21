import { Component, inject, Input, output, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, of, fromEvent } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RestaurantOption {
  id: string;
  name: string;
  cuisine: string | null;
  address: string | null;
  websiteUrl: string | null;
}

@Component({
  selector: 'app-restaurant-autocomplete',
  standalone: true,
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Restaurant name</mat-label>
      <input
        #nameInput
        matInput
        [formControl]="nameControl"
        [matAutocomplete]="auto"
        data-testid="name-input"
        autocomplete="off"
        aria-label="Restaurant name"
      />
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayName"
        (optionSelected)="onSelect($event.option.value)"
        data-testid="autocomplete-panel"
      >
        @for (option of options(); track option.id) {
          <mat-option
            [value]="option"
            [attr.data-testid]="'autocomplete-option-' + option.id"
            [attr.aria-label]="option.name"
          >
            <span class="option-name">{{ option.name }}</span>
            @if (option.cuisine) {
              <span class="option-cuisine"> · {{ option.cuisine }}</span>
            }
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`
    .full-width { width: 100%; }
    .option-cuisine { color: var(--mat-sys-on-surface-variant); font-size: 12px; }
  `],
})
export class RestaurantAutocompleteComponent implements OnInit, OnDestroy {
  @Input({ required: true }) teamId!: string;
  @Input() initialValue = '';
  @ViewChild('nameInput', { static: false }) nameInput!: ElementRef<HTMLInputElement>;

  readonly selected = output<RestaurantOption | null>();
  readonly nameChanged = output<string>();

  private readonly http = inject(HttpClient);
  private readonly destroy$ = new Subject<void>();

  readonly nameControl = new FormControl('');
  readonly options = signal<RestaurantOption[]>([]);

  ngOnInit(): void {
    if (this.initialValue) {
      this.nameControl.setValue(this.initialValue);
    }

    this.nameControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const q = typeof value === 'string' ? value : (value as RestaurantOption | null)?.name ?? '';
        this.nameChanged.emit(q);
        if (!q || q.length < 2) {
          this.options.set([]);
          return of([] as RestaurantOption[]);
        }
        return this.http.get<RestaurantOption[]>(
          `${environment.apiBaseUrl}/teams/${this.teamId}/restaurants?query=${encodeURIComponent(q)}&limit=10`
        );
      }),
    ).subscribe(results => this.options.set(results));
  }

  displayName(option: RestaurantOption | string | null): string {
    if (!option) return '';
    return typeof option === 'string' ? option : option.name;
  }

  onSelect(option: RestaurantOption): void {
    this.selected.emit(option);
  }

  getValue(): string {
    const v = this.nameControl.value;
    return typeof v === 'string' ? v : (v as RestaurantOption | null)?.name ?? '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
