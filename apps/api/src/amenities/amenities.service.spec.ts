import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { PrismaService } from '../prisma/prisma.service';

const mockAmenity = {
  id: 'amenity-1',
  hotelId: 'hotel-1',
  name: 'Pool',
  category: 'RECREATION',
  description: 'Outdoor pool',
};

describe('AmenitiesService', () => {
  let service: AmenitiesService;
  let prisma: {
    tenant: {
      amenity: {
        findMany: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
      };
    };
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        amenity: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AmenitiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AmenitiesService);
  });

  describe('create', () => {
    it('should create amenity with hotelId', async () => {
      const dto = {
        name: 'Pool',
        category: 'RECREATION',
        description: 'Outdoor pool',
      };
      prisma.tenant.amenity.create.mockResolvedValue(mockAmenity);

      const result = await service.create('hotel-1', dto as any);

      expect(prisma.tenant.amenity.create).toHaveBeenCalledWith({
        data: { ...dto, hotelId: 'hotel-1' },
      });
      expect(result).toEqual(mockAmenity);
    });
  });

  describe('findAll', () => {
    it('should return all amenities for hotel without category filter', async () => {
      prisma.tenant.amenity.findMany.mockResolvedValue([mockAmenity]);

      const result = await service.findAll('hotel-1');

      expect(prisma.tenant.amenity.findMany).toHaveBeenCalledWith({
        where: { hotelId: 'hotel-1' },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([mockAmenity]);
    });

    it('should filter by category when provided', async () => {
      prisma.tenant.amenity.findMany.mockResolvedValue([mockAmenity]);

      const result = await service.findAll('hotel-1', 'RECREATION');

      expect(prisma.tenant.amenity.findMany).toHaveBeenCalledWith({
        where: { hotelId: 'hotel-1', category: 'RECREATION' },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([mockAmenity]);
    });
  });

  describe('findOne', () => {
    it('should return amenity by id', async () => {
      prisma.tenant.amenity.findUnique.mockResolvedValue(mockAmenity);

      const result = await service.findOne('amenity-1');

      expect(prisma.tenant.amenity.findUnique).toHaveBeenCalledWith({
        where: { id: 'amenity-1' },
      });
      expect(result).toEqual(mockAmenity);
    });

    it('should throw NotFoundException when amenity not found', async () => {
      prisma.tenant.amenity.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update amenity', async () => {
      const dto = { name: 'Heated Pool' };
      prisma.tenant.amenity.findUnique.mockResolvedValue(mockAmenity);
      prisma.tenant.amenity.update.mockResolvedValue({
        ...mockAmenity,
        name: 'Heated Pool',
      });

      const result = await service.update('amenity-1', dto as any);

      expect(prisma.tenant.amenity.update).toHaveBeenCalledWith({
        where: { id: 'amenity-1' },
        data: dto,
      });
      expect(result.name).toBe('Heated Pool');
    });
  });

  describe('remove', () => {
    it('should delete amenity', async () => {
      prisma.tenant.amenity.findUnique.mockResolvedValue(mockAmenity);
      prisma.tenant.amenity.delete.mockResolvedValue(mockAmenity);

      const result = await service.remove('amenity-1');

      expect(prisma.tenant.amenity.delete).toHaveBeenCalledWith({
        where: { id: 'amenity-1' },
      });
      expect(result).toEqual(mockAmenity);
    });
  });
});
