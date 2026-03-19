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
  listeners.forEach((l) => l());
}
export function clearConfig() {
  guestConfig = null;
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
