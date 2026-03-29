import { z } from 'zod';

export const updateDataUsageSchema = z.object({
  dataUsedMb: z.number().int().min(0),
});

export type UpdateDataUsageDto = z.infer<typeof updateDataUsageSchema>;
