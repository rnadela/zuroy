const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('zuroy_token') : null;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message || res.statusText);
  }
  return res.json();
}

/** Get the current user's hotelId for scoped API calls */
export function getHotelId(): string {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('zuroy_user') : null;
  const user = raw ? JSON.parse(raw) : null;
  return user?.hotelId || '';
}

/** Helper for hotel-scoped API paths */
export function hotelApi<T>(path: string, options?: RequestInit): Promise<T> {
  return api<T>(`/hotels/${getHotelId()}${path}`, options);
}
