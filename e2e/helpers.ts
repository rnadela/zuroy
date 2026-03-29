import { APIRequestContext } from '@playwright/test';

export const API_URL =
  process.env.E2E_API_URL || `http://127.0.0.1:${process.env.E2E_API_PORT || '3001'}`;
export const PORTAL_URL =
  process.env.E2E_PORTAL_URL || `http://127.0.0.1:${process.env.E2E_PORTAL_PORT || '3000'}`;
export const CONNECT_URL =
  process.env.E2E_CONNECT_URL || `http://127.0.0.1:${process.env.E2E_CONNECT_PORT || '3002'}`;

interface LoginResult {
  accessToken: string;
  user: { id: string; email: string; firstName: string; lastName: string; role: string; hotelId?: string };
}

export async function adminLogin(request: APIRequestContext): Promise<LoginResult> {
  const res = await request.post(`${API_URL}/v1/auth/login`, {
    data: { email: 'admin@zuroy.com', password: 'AdminPassword123!' },
  });
  return await res.json();
}

export async function staffLogin(request: APIRequestContext): Promise<LoginResult> {
  const res = await request.post(`${API_URL}/v1/auth/login`, {
    data: { email: 'staff@testhotel.com', password: 'StaffPassword123!' },
  });
  return await res.json();
}
