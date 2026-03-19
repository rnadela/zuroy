import { z } from 'zod';

export const createAmenitySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  hours: z.string().optional(),
  photoUrls: z.array(z.string().url()).default([]),
});

export const updateAmenitySchema = createAmenitySchema.partial();

export type CreateAmenityDto = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityDto = z.infer<typeof updateAmenitySchema>;
