import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServiceCatalogService } from './service-catalog.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ServiceCatalogService', () => {
  let service: ServiceCatalogService;
  const prisma = {
    tenant: {
      serviceItem: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ServiceCatalogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ServiceCatalogService);
  });

  it('should create service item with hotelId', async () => {
    const dto = { name: 'Room Service', category: 'FOOD', price: 20 };
    prisma.tenant.serviceItem.create.mockResolvedValue({ id: 's1', ...dto });
    const result = await service.create('h1', dto as any);
    expect(prisma.tenant.serviceItem.create).toHaveBeenCalledWith({
      data: { ...dto, hotelId: 'h1' },
    });
    expect(result.id).toBe('s1');
  });

  it('should findAll with hotelId only', async () => {
    prisma.tenant.serviceItem.findMany.mockResolvedValue([]);
    await service.findAll('h1');
    expect(prisma.tenant.serviceItem.findMany).toHaveBeenCalledWith({
      where: { hotelId: 'h1' },
      orderBy: { name: 'asc' },
    });
  });

  it('should findAll with category filter', async () => {
    prisma.tenant.serviceItem.findMany.mockResolvedValue([]);
    await service.findAll('h1', 'FOOD');
    expect(prisma.tenant.serviceItem.findMany).toHaveBeenCalledWith({
      where: { hotelId: 'h1', category: 'FOOD' },
      orderBy: { name: 'asc' },
    });
  });

  it('should findOne returning item', async () => {
    prisma.tenant.serviceItem.findUnique.mockResolvedValue({ id: 's1' });
    const result = await service.findOne('s1');
    expect(result).toEqual({ id: 's1' });
  });

  it('should throw NotFoundException when item missing', async () => {
    prisma.tenant.serviceItem.findUnique.mockResolvedValue(null);
    await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
  });

  it('should update existing item', async () => {
    prisma.tenant.serviceItem.findUnique.mockResolvedValue({ id: 's1' });
    prisma.tenant.serviceItem.update.mockResolvedValue({
      id: 's1',
      name: 'X',
    });
    const result = await service.update('s1', { name: 'X' } as any);
    expect(result.name).toBe('X');
  });

  it('should remove existing item', async () => {
    prisma.tenant.serviceItem.findUnique.mockResolvedValue({ id: 's1' });
    prisma.tenant.serviceItem.delete.mockResolvedValue({ id: 's1' });
    const result = await service.remove('s1');
    expect(result.id).toBe('s1');
  });
});
