import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';

const mockReservation = {
  id: 'res-1',
  hotelId: 'hotel-1',
  guestName: 'Jane Doe',
  roomId: 'room-1',
  checkIn: new Date('2026-04-01'),
  checkOut: new Date('2026-04-05'),
  status: 'PENDING',
  deviceId: null,
  provisioningToken: null,
  provisioningTokenExpiresAt: null,
  room: { id: 'room-1', number: '101' },
};

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: {
    tenant: {
      reservation: {
        findMany: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
    };
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        reservation: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ReservationsService);
  });

  describe('create', () => {
    it('should create reservation with hotelId', async () => {
      const dto = {
        guestName: 'Jane Doe',
        roomId: 'room-1',
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
      };
      prisma.tenant.reservation.create.mockResolvedValue(mockReservation);

      const result = await service.create('hotel-1', dto as any);

      expect(prisma.tenant.reservation.create).toHaveBeenCalledWith({
        data: { ...dto, hotelId: 'hotel-1' },
      });
      expect(result).toEqual(mockReservation);
    });
  });

  describe('checkIn', () => {
    it('should generate token, set CHECKED_IN status, return raw token', async () => {
      prisma.tenant.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'PENDING',
      });
      prisma.tenant.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'CHECKED_IN',
      });

      const result = await service.checkIn('res-1', { deviceId: 'device-1' });

      expect(result).toHaveProperty('provisioningToken');
      expect(typeof result.provisioningToken).toBe('string');
      expect(result.provisioningToken.length).toBe(64); // 32 bytes hex

      const updateCall = prisma.tenant.reservation.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe('CHECKED_IN');
      expect(updateCall.data.deviceId).toBe('device-1');
      expect(updateCall.data.provisioningToken).toBeDefined();
      expect(updateCall.data.provisioningTokenExpiresAt).toBeInstanceOf(Date);
    });

    it('should throw BadRequestException when status is not PENDING', async () => {
      prisma.tenant.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'CHECKED_IN',
      });

      await expect(
        service.checkIn('res-1', { deviceId: 'device-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      prisma.tenant.reservation.findUnique.mockResolvedValue(null);

      await expect(
        service.checkIn('nonexistent', { deviceId: 'device-1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkOut', () => {
    it('should set CHECKED_OUT status and clear token/deviceId', async () => {
      prisma.tenant.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'CHECKED_IN',
      });
      const checkedOut = {
        ...mockReservation,
        status: 'CHECKED_OUT',
        provisioningToken: null,
        deviceId: null,
      };
      prisma.tenant.reservation.update.mockResolvedValue(checkedOut);

      const result = await service.checkOut('res-1');

      expect(prisma.tenant.reservation.update).toHaveBeenCalledWith({
        where: { id: 'res-1' },
        data: {
          status: 'CHECKED_OUT',
          provisioningToken: null,
          provisioningTokenExpiresAt: null,
          deviceId: null,
        },
      });
      expect(result.status).toBe('CHECKED_OUT');
    });

    it('should throw BadRequestException when status is not CHECKED_IN', async () => {
      prisma.tenant.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'PENDING',
      });

      await expect(service.checkOut('res-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when reservation not found', async () => {
      prisma.tenant.reservation.findUnique.mockResolvedValue(null);

      await expect(service.checkOut('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
