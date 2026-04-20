import { ElementRef } from '@angular/core';

export function focusFirstError(formRef: ElementRef<HTMLElement>): void {
  const invalid = formRef.nativeElement.querySelector<HTMLElement>(
    '[aria-invalid="true"], .ng-invalid input, .ng-invalid select, .ng-invalid textarea',
  );
  invalid?.focus();
}

export function restoreFocusTo(el: HTMLElement | ElementRef<HTMLElement> | null): void {
  const target = el instanceof ElementRef ? el.nativeElement : el;
  target?.focus();
}
