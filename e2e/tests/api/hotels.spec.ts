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
