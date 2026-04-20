import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from './notification.service';
import { NotificationKind } from './snack.config';

@Component({
  selector: 'app-test-notify',
  standalone: true,
  template: `<div aria-live="polite"></div>`,
})
export class TestNotifyPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const kind = (params.get('kind') ?? 'info') as NotificationKind;
      const msg = params.get('msg') ?? 'Test notification';
      this.notifications.show({ kind, message: msg });
    });
  }
}
