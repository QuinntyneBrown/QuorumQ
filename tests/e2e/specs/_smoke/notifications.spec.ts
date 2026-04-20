import { test } from '@playwright/test';
import { ToastComponent } from '../../pages/components/toast.component';

test('[smoke] notification service emits a toast and announces it politely', async ({ page }) => {
  const toast = new ToastComponent(page);
  await toast.goto('http://localhost:4200/_test/notify?kind=info&msg=Hello+QuorumQ');
  await toast.awaitToast('Hello QuorumQ');
});
