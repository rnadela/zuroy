import { test, expect } from '@playwright/test';
import { API_URL } from '../../helpers';

test.describe('Health API', () => {
  test('GET /v1/health returns ok with db + redis', async ({ request }) => {
    const res = await request.get(`${API_URL}/v1/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.details.database.status).toBe('up');
  });
});
