import AsyncStorage from '@react-native-async-storage/async-storage';

interface GuestConfig {
  id: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  room: { id: string; number: string; floor?: number; type?: string };
  hotel: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundUrl?: string;
  };
}

let guestConfig: GuestConfig | null = null;
let listeners: (() => void)[] = [];

export function getConfig() {
  return guestConfig;
}
export function setConfig(config: GuestConfig) {
  guestConfig = config;
  AsyncStorage.setItem('zuroy_config', JSON.stringify(config));
  listeners.forEach((l) => l());
}
export function clearConfig() {
  guestConfig = null;
  AsyncStorage.removeItem('zuroy_config');
  AsyncStorage.removeItem('zuroy_theme');
  listeners.forEach((l) => l());
}
export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
export function isProvisioned() {
  return guestConfig !== null;
}
export async function loadPersistedConfig(): Promise<boolean> {
  const raw = await AsyncStorage.getItem('zuroy_config');
  if (raw) {
    guestConfig = JSON.parse(raw);
    listeners.forEach((l) => l());
    return true;
  }
  return false;
}
