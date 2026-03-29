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

  test('POST /v1/auth/login with non-existent email returns 401', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/auth/login`, {
      data: { email: 'nobody@nowhere.com', password: 'SomePassword123!' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /v1/auth/login with missing fields returns 400', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/auth/login`, {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('POST /v1/auth/login with missing password returns 400', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/auth/login`, {
      data: { email: 'admin@zuroy.com' },
    });
    expect(res.status()).toBe(400);
  });

  test('GET protected route without token returns 401', async ({ request }) => {
    const res = await request.get(`${API_URL}/v1/hotels`);
    expect(res.status()).toBe(401);
  });

  test('GET protected route with garbage token returns 401', async ({ request }) => {
    const res = await request.get(`${API_URL}/v1/hotels`, {
      headers: { Authorization: 'Bearer totally.invalid.token' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET admin route with expired-style token returns 401', async ({ request }) => {
    // A structurally valid but expired/forged JWT
    const fakeJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxfQ.invalid_sig';
    const res = await request.get(`${API_URL}/v1/hotels`, {
      headers: { Authorization: `Bearer ${fakeJwt}` },
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
