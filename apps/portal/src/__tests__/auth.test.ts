import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../lib/api', () => ({
  api: vi.fn(),
}));

import { login, logout, getUser, getToken } from '../lib/auth';
import { api } from '../lib/api';

describe('auth', () => {
  const mockApi = vi.mocked(api);

  beforeEach(() => {
    localStorage.clear();
    mockApi.mockReset();
  });

  describe('login', () => {
    it('stores token + user in localStorage and returns response', async () => {
      const response = {
        accessToken: 'token-1',
        user: {
          id: 'u1',
          email: 'a@b.com',
          firstName: 'A',
          lastName: 'B',
          role: 'SUPER_ADMIN',
        },
      };
      mockApi.mockResolvedValue(response);
      const result = await login('a@b.com', 'secret');
      expect(result).toEqual(response);
      expect(localStorage.getItem('zuroy_token')).toBe('token-1');
      expect(localStorage.getItem('zuroy_user')).toBe(JSON.stringify(response.user));
    });
  });

  describe('logout', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { href: '' },
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    });

    it('clears localStorage and redirects to /login', () => {
      localStorage.setItem('zuroy_token', 'x');
      localStorage.setItem('zuroy_user', '{}');
      logout();
      expect(localStorage.getItem('zuroy_token')).toBeNull();
      expect(localStorage.getItem('zuroy_user')).toBeNull();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('getUser', () => {
    it('returns parsed user when stored', () => {
      localStorage.setItem('zuroy_user', JSON.stringify({ id: 'u1' }));
      expect(getUser()).toEqual({ id: 'u1' });
    });

    it('returns null when no user stored', () => {
      expect(getUser()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('returns token when stored', () => {
      localStorage.setItem('zuroy_token', 'tok');
      expect(getToken()).toBe('tok');
    });

    it('returns null when no token', () => {
      expect(getToken()).toBeNull();
    });
  });
});
