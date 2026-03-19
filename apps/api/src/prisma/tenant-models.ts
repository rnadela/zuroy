// Models that have a hotelId field and should be auto-scoped by tenant
export const TENANT_SCOPED_MODELS = [
  'Room',
  'Device',
  'Reservation',
  'Amenity',
  'ServiceItem',
  'ServiceRequest',
] as const;
