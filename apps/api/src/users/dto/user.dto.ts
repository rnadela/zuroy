import { z } from 'zod';

export const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(12),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    role: z.enum(['SUPER_ADMIN', 'HOTEL_STAFF']),
    hotelId: z.string().optional(),
  })
  .refine((data) => data.role !== 'HOTEL_STAFF' || data.hotelId, {
    message: 'HOTEL_STAFF requires hotelId',
    path: ['hotelId'],
  });

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.enum(['SUPER_ADMIN', 'HOTEL_STAFF']).optional(),
  hotelId: z.string().nullable().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
