import { test, expect } from '@playwright/test';
import { apiGet } from '../../support/api-client';

test('[smoke] API /health returns 200', async () => {
  const response = await apiGet('/health');
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body).toEqual({ status: 'ok' });
});
