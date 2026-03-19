import { z } from 'zod';

export const createDeviceSchema = z.object({
  serialNumber: z.string().min(1),
  deviceModel: z.string().optional(),
});

export const assignDeviceSchema = z.object({ hotelId: z.string().min(1) });

export const heartbeatSchema = z.object({
  batteryLevel: z.number().int().min(0).max(100).optional(),
  appVersion: z.string().optional(),
});

export const provisionSchema = z.object({
  provisioningToken: z.string().min(1),
});

export type CreateDeviceDto = z.infer<typeof createDeviceSchema>;
export type AssignDeviceDto = z.infer<typeof assignDeviceSchema>;
export type HeartbeatDto = z.infer<typeof heartbeatSchema>;
export type ProvisionDto = z.infer<typeof provisionSchema>;
