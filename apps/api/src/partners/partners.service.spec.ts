import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PartnersService } from './partners.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PartnersService', () => {
  let service: PartnersService;

  const prisma = {
    partner: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PartnersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(PartnersService);
  });

  describe('findAll', () => {
    it('should return all partners without filters', async () => {
      const partners = [{ id: 'p1', name: 'Cafe' }];
      prisma.partner.findMany.mockResolvedValue(partners);

      const result = await service.findAll({});

      expect(prisma.partner.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(partners);
    });

    it('should return partners with category filter', async () => {
      prisma.partner.findMany.mockResolvedValue([]);

      await service.findAll({ category: 'RESTAURANT' });

      expect(prisma.partner.findMany).toHaveBeenCalledWith({
        where: { category: 'RESTAURANT' },
        orderBy: { name: 'asc' },
      });
    });

    it('should return partners with boosted filter', async () => {
      prisma.partner.findMany.mockResolvedValue([]);

      await service.findAll({ boosted: true });

      expect(prisma.partner.findMany).toHaveBeenCalledWith({
        where: { boosted: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return partner by id', async () => {
      const partner = { id: 'p1', name: 'Cafe' };
      prisma.partner.findUnique.mockResolvedValue(partner);

      const result = await service.findOne('p1');

      expect(prisma.partner.findUnique).toHaveBeenCalledWith({
        where: { id: 'p1' },
      });
      expect(result).toEqual(partner);
    });

    it('should throw NotFoundException when partner not found', async () => {
      prisma.partner.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a partner', async () => {
      const dto = { name: 'New Cafe', category: 'RESTAURANT' };
      const created = { id: 'p1', ...dto };
      prisma.partner.create.mockResolvedValue(created);

      const result = await service.create(dto as any);

      expect(prisma.partner.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(created);
    });
  });

  describe('findBoosted', () => {
    it('should filter by boosted=true', async () => {
      const boosted = [{ id: 'p1', boosted: true }];
      prisma.partner.findMany.mockResolvedValue(boosted);

      const result = await service.findBoosted();

      expect(prisma.partner.findMany).toHaveBeenCalledWith({
        where: { boosted: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(boosted);
    });

    it('should filter by boosted=true and region', async () => {
      prisma.partner.findMany.mockResolvedValue([]);

      await service.findBoosted('US-WEST');

      expect(prisma.partner.findMany).toHaveBeenCalledWith({
        where: { boosted: true, boostRegion: 'US-WEST' },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findNearby (via findAll)', () => {
    it('should call $queryRaw when lat/lng provided', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 'p1', distanceKm: 5 }]);
      const result = await service.findAll({ lat: 10, lng: 20 });
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'p1', distanceKm: 5 }]);
    });

    it('should include category filter in $queryRaw', async () => {
      prisma.$queryRaw.mockResolvedValue([]);
      await service.findAll({
        lat: 10,
        lng: 20,
        radius: 50,
        category: 'DINING',
      });
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update existing partner', async () => {
      prisma.partner.findUnique.mockResolvedValue({ id: 'p1' });
      const updated = { id: 'p1', name: 'Updated' };
      prisma.partner.update.mockResolvedValue(updated);
      const result = await service.update('p1', { name: 'Updated' } as any);
      expect(result).toEqual(updated);
    });

    it('should throw when partner not found', async () => {
      prisma.partner.findUnique.mockResolvedValue(null);
      await expect(service.update('nope', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete existing partner', async () => {
      prisma.partner.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.partner.delete.mockResolvedValue({ id: 'p1' });
      const result = await service.remove('p1');
      expect(prisma.partner.delete).toHaveBeenCalledWith({
        where: { id: 'p1' },
      });
      expect(result).toEqual({ id: 'p1' });
    });

    it('should throw when partner not found', async () => {
      prisma.partner.findUnique.mockResolvedValue(null);
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
