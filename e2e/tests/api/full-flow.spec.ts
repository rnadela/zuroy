import { test, expect } from '@playwright/test';
import { API_URL, adminLogin } from '../../helpers';

let token: string;
let hotelId: string;
let roomId: string;
let deviceId: string;
let reservationId: string;

test.beforeAll(async ({ request }) => {
  const result = await adminLogin(request);
  token = result.accessToken;
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

test.describe('Full Guest Lifecycle — unhappy paths', () => {
  let unhappyRoomId: string;
  let unhappyDeviceId: string;
  let unhappyReservationId: string;

  test('setup: create room + device + reservation for unhappy tests', async ({ request }) => {
    // Create a room
    const roomRes = await request.post(`${API_URL}/v1/hotels/${hotelId}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { number: '401', floor: 4, type: 'Standard' },
    });
    expect(roomRes.ok()).toBeTruthy();
    unhappyRoomId = (await roomRes.json()).id;

    // Create + assign device
    const devRes = await request.post(`${API_URL}/v1/devices`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { serialNumber: `E2E-UNHAPPY-${Date.now()}`, deviceModel: 'Test Phone' },
    });
    expect(devRes.ok()).toBeTruthy();
    unhappyDeviceId = (await devRes.json()).id;

    await request.post(`${API_URL}/v1/devices/${unhappyDeviceId}/assign`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { hotelId },
    });

    // Create reservation
    const resRes = await request.post(`${API_URL}/v1/hotels/${hotelId}/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        guestName: 'Unhappy Guest',
        guestEmail: 'unhappy@test.com',
        roomId: unhappyRoomId,
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
      },
    });
    expect(resRes.ok()).toBeTruthy();
    unhappyReservationId = (await resRes.json()).id;
  });

  test('check-in already checked-in reservation returns 400', async ({ request }) => {
    // Check in first
    const firstCheckin = await request.post(
      `${API_URL}/v1/hotels/${hotelId}/reservations/${unhappyReservationId}/check-in`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { deviceId: unhappyDeviceId },
      },
    );
    expect(firstCheckin.ok()).toBeTruthy();

    // Second check-in should fail
    const res = await request.post(
      `${API_URL}/v1/hotels/${hotelId}/reservations/${unhappyReservationId}/check-in`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { deviceId: unhappyDeviceId },
      },
    );
    expect(res.status()).toBe(400);
  });

  test('check-out a PENDING reservation returns 400', async ({ request }) => {
    // Create a fresh reservation that stays PENDING
    const pendingRoom = await request.post(`${API_URL}/v1/hotels/${hotelId}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { number: '402', floor: 4, type: 'Standard' },
    });
    const pendingRoomId = (await pendingRoom.json()).id;

    const resRes = await request.post(`${API_URL}/v1/hotels/${hotelId}/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        guestName: 'Pending Guest',
        guestEmail: 'pending@test.com',
        roomId: pendingRoomId,
        checkIn: '2026-07-01',
        checkOut: '2026-07-05',
      },
    });
    expect(resRes.ok()).toBeTruthy();
    const pendingResId = (await resRes.json()).id;

    // Try to check out without checking in first
    const res = await request.post(
      `${API_URL}/v1/hotels/${hotelId}/reservations/${pendingResId}/check-out`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(res.status()).toBe(400);
  });

  test('create reservation with past dates (checkOut before checkIn) returns 400', async ({
    request,
  }) => {
    const res = await request.post(`${API_URL}/v1/hotels/${hotelId}/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        guestName: 'Bad Dates Guest',
        guestEmail: 'baddates@test.com',
        roomId: unhappyRoomId,
        checkIn: '2026-06-10',
        checkOut: '2026-06-05',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('create room with duplicate number returns 409 or 500', async ({ request }) => {
    // Room 401 was already created in setup
    const res = await request.post(`${API_URL}/v1/hotels/${hotelId}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { number: '401', floor: 4, type: 'Standard' },
    });
    expect([409, 500]).toContain(res.status());
  });
});
