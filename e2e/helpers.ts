import { APIRequestContext } from '@playwright/test';

export const API_URL =
  process.env.E2E_API_URL || `http://127.0.0.1:${process.env.E2E_API_PORT || '3001'}`;
export const PORTAL_URL =
  process.env.E2E_PORTAL_URL || `http://127.0.0.1:${process.env.E2E_PORTAL_PORT || '3000'}`;
export const CONNECT_URL =
  process.env.E2E_CONNECT_URL || `http://127.0.0.1:${process.env.E2E_CONNECT_PORT || '3002'}`;

export async function adminLogin(request: APIRequestContext) {
  const res = await request.post(`${API_URL}/v1/auth/login`, {
    data: { email: 'admin@zuroy.com', password: 'AdminPassword123!' },
  });
  const body = await res.json();
  return body.accessToken as string;
}

export async function staffLogin(request: APIRequestContext) {
  const res = await request.post(`${API_URL}/v1/auth/login`, {
    data: { email: 'staff@testhotel.com', password: 'StaffPassword123!' },
  });
  const body = await res.json();
  return body.accessToken as string;
}
