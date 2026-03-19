import { api } from './api';

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; firstName: string; lastName: string; role: string };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('zuroy_token', data.accessToken);
  localStorage.setItem('zuroy_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('zuroy_token');
  localStorage.removeItem('zuroy_user');
  window.location.href = '/login';
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('zuroy_user');
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('zuroy_token');
}
