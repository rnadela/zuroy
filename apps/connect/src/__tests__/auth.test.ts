import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../lib/api', () => ({
  api: vi.fn(),
}));

import { login, logout, getUser } from '../lib/auth';
import { api } from '../lib/api';

describe('connect auth', () => {
  const mockApi = vi.mocked(api);

  beforeEach(() => {
    localStorage.clear();
    mockApi.mockReset();
  });

  it('login stores token and user in localStorage', async () => {
    const response = {
      accessToken: 'tok-1',
      user: {
        id: 'u1',
        email: 's@hotel.com',
        firstName: 'S',
        lastName: 'T',
        role: 'HOTEL_STAFF',
        hotelId: 'h1',
      },
    };
    mockApi.mockResolvedValue(response);
    const result = await login('s@hotel.com', 'pw');
    expect(result).toEqual(response);
    expect(localStorage.getItem('zuroy_token')).toBe('tok-1');
    expect(JSON.parse(localStorage.getItem('zuroy_user')!)).toEqual(response.user);
  });

  describe('logout', () => {
    const original = window.location;
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { href: '' },
      });
    });
    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: original,
      });
    });
    it('clears storage and redirects to /login', () => {
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

    it('returns null when no user', () => {
      expect(getUser()).toBeNull();
    });
  });
});
