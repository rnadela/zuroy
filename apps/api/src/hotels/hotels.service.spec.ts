import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { PrismaService } from '../prisma/prisma.service';

const mockHotel = {
  id: 'hotel-1',
  name: 'Test Hotel',
  slug: 'test-hotel',
  address: '123 Main St',
  city: 'Austin',
  state: 'TX',
  country: 'US',
  timezone: 'America/Chicago',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('HotelsService', () => {
  let service: HotelsService;
  let prisma: {
    hotel: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      hotel: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [HotelsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(HotelsService);
  });

  describe('findAll', () => {
    it('should return list of hotels', async () => {
      prisma.hotel.findMany.mockResolvedValue([mockHotel]);

      const result = await service.findAll();

      expect(result).toEqual([mockHotel]);
      expect(prisma.hotel.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return hotel by id', async () => {
      prisma.hotel.findUnique.mockResolvedValue(mockHotel);

      const result = await service.findOne('hotel-1');

      expect(result).toEqual(mockHotel);
      expect(prisma.hotel.findUnique).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
      });
    });

    it('should throw NotFoundException when hotel not found', async () => {
      prisma.hotel.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create hotel with data', async () => {
      const dto = { name: 'New Hotel', slug: 'new-hotel' };
      prisma.hotel.create.mockResolvedValue({ ...mockHotel, ...dto });

      const result = await service.create(dto as any);

      expect(prisma.hotel.create).toHaveBeenCalledWith({ data: dto });
      expect(result.name).toBe('New Hotel');
    });
  });

  describe('update', () => {
    it('should update hotel', async () => {
      const dto = { name: 'Updated Hotel' };
      prisma.hotel.findUnique.mockResolvedValue(mockHotel);
      prisma.hotel.update.mockResolvedValue({ ...mockHotel, ...dto });

      const result = await service.update('hotel-1', dto as any);

      expect(prisma.hotel.update).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
        data: dto,
      });
      expect(result.name).toBe('Updated Hotel');
    });

    it('should throw NotFoundException when updating nonexistent hotel', async () => {
      prisma.hotel.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete hotel', async () => {
      prisma.hotel.findUnique.mockResolvedValue(mockHotel);
      prisma.hotel.delete.mockResolvedValue(mockHotel);

      const result = await service.remove('hotel-1');

      expect(prisma.hotel.delete).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
      });
      expect(result).toEqual(mockHotel);
    });

    it('should throw NotFoundException when deleting nonexistent hotel', async () => {
      prisma.hotel.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
