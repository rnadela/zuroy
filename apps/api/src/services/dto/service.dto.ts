import { z } from 'zod';

export const createServiceItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.number().positive(),
  available: z.boolean().default(true),
});

export const updateServiceItemSchema = createServiceItemSchema.partial();

export const createServiceRequestSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  notes: z.string().max(500).optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(['COMPLETED', 'CANCELLED']),
});

export type CreateServiceItemDto = z.infer<typeof createServiceItemSchema>;
export type UpdateServiceItemDto = z.infer<typeof updateServiceItemSchema>;
export type CreateServiceRequestDto = z.infer<
  typeof createServiceRequestSchema
>;
export type UpdateRequestStatusDto = z.infer<typeof updateRequestStatusSchema>;
