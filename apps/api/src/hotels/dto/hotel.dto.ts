import { z } from 'zod';

export const createHotelSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundUrl: z.string().url().optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

export type CreateHotelDto = z.infer<typeof createHotelSchema>;
export type UpdateHotelDto = z.infer<typeof updateHotelSchema>;
