import { z } from 'zod';

export const createRoomSchema = z.object({
  number: z.string().min(1).max(20),
  floor: z.number().int().optional(),
  type: z.string().max(50).optional(),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
export type UpdateRoomDto = z.infer<typeof updateRoomSchema>;
