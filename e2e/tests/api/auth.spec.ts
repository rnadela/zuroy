import { test, expect } from '@playwright/test';
import { API_URL } from '../../helpers';

let adminToken: string;

test.describe('Auth API', () => {
  test('POST /v1/auth/login with valid credentials', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/auth/login`, {
      data: { email: 'admin@zuroy.com', password: 'AdminPassword123!' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.accessToken).toBeTruthy();
    expect(body.user.role).toBe('SUPER_ADMIN');
    adminToken = body.accessToken;
  });

  test('POST /v1/auth/login with wrong password returns 401', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/auth/login`, {
      data: { email: 'admin@zuroy.com', password: 'wrongpassword1' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /v1/auth/logout revokes token', async ({ request }) => {
    // Login first
    const loginRes = await request.post(`${API_URL}/v1/auth/login`, {
      data: { email: 'admin@zuroy.com', password: 'AdminPassword123!' },
    });
    const token = (await loginRes.json()).accessToken;

    // Logout
    const logoutRes = await request.post(`${API_URL}/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(logoutRes.ok()).toBeTruthy();

    // Token should be revoked
    const checkRes = await request.get(`${API_URL}/v1/hotels`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(checkRes.status()).toBe(401);
  });
});
