const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/v1';

let deviceToken: string | null = null;
export function setDeviceToken(token: string) {
  deviceToken = token;
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(deviceToken ? { 'X-Device-Token': deviceToken } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
  return res.json();
}
