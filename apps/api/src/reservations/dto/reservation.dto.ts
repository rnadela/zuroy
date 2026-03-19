import { z } from 'zod';

export const createReservationSchema = z
  .object({
    guestName: z.string().min(1).max(200),
    guestEmail: z.string().email().optional(),
    guestPhone: z.string().max(30).optional(),
    roomId: z.string().min(1),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: 'checkOut must be after checkIn',
    path: ['checkOut'],
  });

export const updateReservationSchema = z.object({
  guestName: z.string().min(1).max(200).optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().max(30).optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
});

export const checkInSchema = z.object({
  deviceId: z.string().min(1),
});

export type CreateReservationDto = z.infer<typeof createReservationSchema>;
export type UpdateReservationDto = z.infer<typeof updateReservationSchema>;
export type CheckInDto = z.infer<typeof checkInSchema>;
