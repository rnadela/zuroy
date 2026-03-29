import { test, expect } from '@playwright/test';
import { API_URL, adminLogin } from '../../helpers';

let token: string;
let hotelId: string;
const uid = Date.now();

test.beforeAll(async ({ request }) => {
  token = await adminLogin(request);
});

test.describe('Hotels API', () => {
  test('GET /v1/hotels lists hotels', async ({ request }) => {
    const res = await request.get(`${API_URL}/v1/hotels`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('POST /v1/hotels creates hotel', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/hotels`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `API Hotel ${uid}`, slug: `api-hotel-${uid}`, address: '789 API St' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.name).toBe(`API Hotel ${uid}`);
    hotelId = body.id;
  });

  test('GET /v1/hotels/:id returns hotel', async ({ request }) => {
    const res = await request.get(`${API_URL}/v1/hotels/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.slug).toBe(`api-hotel-${uid}`);
  });

  test('PATCH /v1/hotels/:id updates hotel', async ({ request }) => {
    const res = await request.patch(`${API_URL}/v1/hotels/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { address: 'Updated Address' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.address).toBe('Updated Address');
  });
});

test.describe('Hotels API — unhappy paths', () => {
  test('POST /v1/hotels with missing name returns 400', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/hotels`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { slug: `no-name-${uid}`, address: '123 Missing Name St' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /v1/hotels with duplicate slug returns 409 or 500', async ({ request }) => {
    // First create succeeds (already created above with slug `api-hotel-${uid}`)
    const res = await request.post(`${API_URL}/v1/hotels`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `Duplicate Slug Hotel`, slug: `api-hotel-${uid}`, address: '456 Dup St' },
    });
    expect([409, 500]).toContain(res.status());
  });

  test('GET /v1/hotels/:id with non-existent ID returns 404', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request.get(`${API_URL}/v1/hotels/${fakeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
  });

  test('DELETE /v1/hotels/:id without token returns 401', async ({ request }) => {
    const res = await request.delete(`${API_URL}/v1/hotels/${hotelId}`);
    expect(res.status()).toBe(401);
  });

  test('DELETE /v1/hotels/:id with garbage token returns 401', async ({ request }) => {
    const res = await request.delete(`${API_URL}/v1/hotels/${hotelId}`, {
      headers: { Authorization: 'Bearer garbage.token.here' },
    });
    expect(res.status()).toBe(401);
  });

  test('PATCH /v1/hotels/:id with invalid data returns 400', async ({ request }) => {
    const res = await request.patch(`${API_URL}/v1/hotels/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: '' },
    });
    expect(res.status()).toBe(400);
  });
});
