import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError } from '../lib/api';

describe('api', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls fetch with JSON content-type and returns parsed body', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hello: 'world' }),
    });
    const result = await api<{ hello: string }>('/ping');
    expect(result).toEqual({ hello: 'world' });
    const [, options] = (global.fetch as any).mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('attaches Authorization header when token is stored', async () => {
    localStorage.setItem('zuroy_token', 'abc');
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    await api('/me');
    const [, options] = (global.fetch as any).mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer abc');
  });

  it('throws ApiError with status and message on non-ok response', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ message: 'bad input' }),
    });
    await expect(api('/fail')).rejects.toThrow(ApiError);
    await expect(api('/fail')).rejects.toMatchObject({
      status: 400,
      message: 'bad input',
    });
  });

  it('falls back to statusText when body is not JSON', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: () => Promise.reject(new Error('not json')),
    });
    await expect(api('/fail')).rejects.toMatchObject({
      status: 500,
      message: 'Server Error',
    });
  });

  it('merges custom headers', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    await api('/custom', { headers: { 'X-Custom': 'yes' } });
    const [, options] = (global.fetch as any).mock.calls[0];
    expect(options.headers['X-Custom']).toBe('yes');
  });
});
