import { z } from 'zod';

export const createExtensionSchema = z.object({
  newCheckOut: z.coerce.date(),
  reason: z.string().max(500).optional(),
});

export const rejectExtensionSchema = z.object({
  rejectionNote: z.string().min(1).max(500),
});

export type CreateExtensionDto = z.infer<typeof createExtensionSchema>;
export type RejectExtensionDto = z.infer<typeof rejectExtensionSchema>;
