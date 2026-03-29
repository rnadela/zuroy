import { z } from 'zod';

export const createPartnerSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional(),
  hours: z.string().optional(),
  photoUrls: z.array(z.string().url()).default([]),
  boosted: z.boolean().default(false),
  boostRegion: z.string().optional(),
});

export const updatePartnerSchema = createPartnerSchema.partial();

export const partnerQuerySchema = z.object({
  category: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().default(100),
  boosted: z.coerce.boolean().optional(),
});

export type CreatePartnerDto = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerDto = z.infer<typeof updatePartnerSchema>;
export type PartnerQuery = z.infer<typeof partnerQuerySchema>;
