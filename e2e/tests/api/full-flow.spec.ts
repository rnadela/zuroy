import { test, expect } from '@playwright/test';
import { API_URL, adminLogin } from '../../helpers';

let token: string;
let hotelId: string;
let roomId: string;
let deviceId: string;
let reservationId: string;

test.beforeAll(async ({ request }) => {
  token = await adminLogin(request);
  // Get the seeded hotel
  const hotels = await (
    await request.get(`${API_URL}/v1/hotels`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json();
  hotelId = hotels[0].id;
});

test.describe('Full Guest Lifecycle', () => {
  test('1. Create room', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/hotels/${hotelId}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { number: '301', floor: 3, type: 'Suite' },
    });
    expect(res.ok()).toBeTruthy();
    roomId = (await res.json()).id;
  });

  test('2. Register + assign device', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/v1/devices`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { serialNumber: `E2E-FLOW-${Date.now()}`, deviceModel: 'Test Phone' },
    });
    expect(createRes.ok()).toBeTruthy();
    deviceId = (await createRes.json()).id;

    const assignRes = await request.post(`${API_URL}/v1/devices/${deviceId}/assign`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { hotelId },
    });
    expect(assignRes.ok()).toBeTruthy();
  });

  test('3. Create reservation', async ({ request }) => {
    const res = await request.post(`${API_URL}/v1/hotels/${hotelId}/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        guestName: 'E2E Guest',
        guestEmail: 'guest@test.com',
        roomId,
        checkIn: '2026-05-01',
        checkOut: '2026-05-05',
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('PENDING');
    reservationId = body.id;
  });

  test('4. Check-in (generates provisioning token + hotspot)', async ({ request }) => {
    const res = await request.post(
      `${API_URL}/v1/hotels/${hotelId}/reservations/${reservationId}/check-in`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { deviceId },
      },
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.provisioningToken).toBeTruthy();
    expect(body.hotspotSsid).toBeTruthy();
    expect(body.hotspotPassword).toBeTruthy();
    expect(body.hotspotEnabled).toBe(true);
  });

  test('5. Check-out (clears hotspot + device)', async ({ request }) => {
    const res = await request.post(
      `${API_URL}/v1/hotels/${hotelId}/reservations/${reservationId}/check-out`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('CHECKED_OUT');
    expect(body.hotspotEnabled).toBe(false);
    expect(body.deviceId).toBeNull();
  });
});
