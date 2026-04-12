import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, hotelApi, getHotelId, ApiError } from '../lib/api';

describe('connect api', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('api()', () => {
    it('returns parsed JSON on success', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: 1 }),
      });
      const result = await api<{ ok: number }>('/ping');
      expect(result).toEqual({ ok: 1 });
    });

    it('attaches Authorization when token stored', async () => {
      localStorage.setItem('zuroy_token', 'tok');
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      await api('/me');
      const [, options] = (global.fetch as any).mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer tok');
    });

    it('throws ApiError on non-ok', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'missing' }),
      });
      await expect(api('/x')).rejects.toBeInstanceOf(ApiError);
    });

    it('falls back to statusText on unparseable body', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.reject(new Error('not json')),
      });
      await expect(api('/x')).rejects.toMatchObject({
        status: 500,
        message: 'Server Error',
      });
    });

    it('merges custom headers', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      await api('/y', { headers: { 'X-Foo': 'bar' } });
      const [, options] = (global.fetch as any).mock.calls[0];
      expect(options.headers['X-Foo']).toBe('bar');
    });
  });

  describe('getHotelId()', () => {
    it('returns hotelId when user stored', () => {
      localStorage.setItem('zuroy_user', JSON.stringify({ id: 'u1', hotelId: 'h-42' }));
      expect(getHotelId()).toBe('h-42');
    });

    it('returns empty string when no user', () => {
      expect(getHotelId()).toBe('');
    });

    it('returns empty string when user has no hotelId', () => {
      localStorage.setItem('zuroy_user', JSON.stringify({ id: 'u1' }));
      expect(getHotelId()).toBe('');
    });
  });

  describe('hotelApi()', () => {
    it('prepends /hotels/{hotelId} to path', async () => {
      localStorage.setItem('zuroy_user', JSON.stringify({ id: 'u1', hotelId: 'h-1' }));
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });
      await hotelApi('/rooms');
      const [url] = (global.fetch as any).mock.calls[0];
      expect(url).toContain('/hotels/h-1/rooms');
    });
  });
});
