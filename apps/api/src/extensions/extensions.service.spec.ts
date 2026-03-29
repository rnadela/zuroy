import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExtensionsService } from './extensions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutPurgeService } from '../queues/checkout-purge.service';

describe('ExtensionsService', () => {
  let service: ExtensionsService;

  const prisma = {
    tenant: {
      reservation: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      stayExtension: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
    $transaction: vi.fn(),
  };

  const checkoutPurge = {
    cancelCheckoutPurge: vi.fn(),
    scheduleCheckoutPurge: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ExtensionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CheckoutPurgeService, useValue: checkoutPurge },
      ],
    }).compile();
    service = module.get(ExtensionsService);
  });

  describe('create', () => {
    it('should create extension for CHECKED_IN reservation', async () => {
      const reservation = { id: 'r1', status: 'CHECKED_IN' };
      prisma.tenant.reservation.findUnique.mockResolvedValue(reservation);

      const created = { id: 'ext1', reservationId: 'r1' };
      prisma.tenant.stayExtension.create.mockResolvedValue(created);

      const dto = {
        newCheckOut: new Date('2026-04-02'),
        reason: 'Extended stay',
      };
      const result = await service.create('h1', 'r1', dto);

      expect(prisma.tenant.reservation.findUnique).toHaveBeenCalledWith({
        where: { id: 'r1' },
      });
      expect(prisma.tenant.stayExtension.create).toHaveBeenCalledWith({
        data: {
          reservationId: 'r1',
          hotelId: 'h1',
          newCheckOut: dto.newCheckOut,
          reason: 'Extended stay',
        },
      });
      expect(result).toEqual(created);
    });

    it('should throw BadRequestException for non-CHECKED_IN reservation', async () => {
      prisma.tenant.reservation.findUnique.mockResolvedValue({
        id: 'r1',
        status: 'CHECKED_OUT',
      });

      await expect(
        service.create('h1', 'r1', {
          newCheckOut: new Date(),
          reason: 'test',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      prisma.tenant.reservation.findUnique.mockResolvedValue(null);

      await expect(
        service.create('h1', 'r1', {
          newCheckOut: new Date(),
          reason: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should update extension status, reservation checkOut, and reschedule purge', async () => {
      const newCheckOut = new Date('2026-04-05');
      const extension = {
        id: 'ext1',
        reservationId: 'r1',
        newCheckOut,
        reservation: { id: 'r1' },
      };
      prisma.tenant.stayExtension.findUnique.mockResolvedValue(extension);

      const updatedExt = { ...extension, status: 'APPROVED' };
      prisma.$transaction.mockResolvedValue([updatedExt, {}]);

      const result = await service.approve('ext1');

      expect(prisma.tenant.stayExtension.findUnique).toHaveBeenCalledWith({
        where: { id: 'ext1' },
        include: { reservation: true },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(checkoutPurge.cancelCheckoutPurge).toHaveBeenCalledWith('r1');
      expect(checkoutPurge.scheduleCheckoutPurge).toHaveBeenCalledWith(
        'r1',
        newCheckOut,
      );
      expect(result).toEqual(updatedExt);
    });

    it('should throw NotFoundException when extension not found', async () => {
      prisma.tenant.stayExtension.findUnique.mockResolvedValue(null);

      await expect(service.approve('ext-nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reject', () => {
    it('should set REJECTED status and rejectionNote', async () => {
      const extension = { id: 'ext1', status: 'PENDING' };
      prisma.tenant.stayExtension.findUnique.mockResolvedValue(extension);

      const updated = {
        ...extension,
        status: 'REJECTED',
        rejectionNote: 'No availability',
      };
      prisma.tenant.stayExtension.update.mockResolvedValue(updated);

      const result = await service.reject('ext1', {
        rejectionNote: 'No availability',
      });

      expect(prisma.tenant.stayExtension.update).toHaveBeenCalledWith({
        where: { id: 'ext1' },
        data: { status: 'REJECTED', rejectionNote: 'No availability' },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when extension not found', async () => {
      prisma.tenant.stayExtension.findUnique.mockResolvedValue(null);

      await expect(
        service.reject('ext-nope', { rejectionNote: 'nope' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
