import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { PrismaService } from '../prisma/prisma.service';

const mockItem = {
  id: 'item-1',
  name: 'Room Service Burger',
  price: 15.5,
  hotelId: 'hotel-1',
};

const mockRequest = {
  id: 'req-1',
  reservationId: 'res-1',
  itemId: 'item-1',
  quantity: 2,
  notes: 'No onions',
  chargeAmount: 31.0,
  hotelId: 'hotel-1',
  status: 'PENDING',
  createdAt: new Date(),
  item: mockItem,
};

describe('ServiceRequestsService', () => {
  let service: ServiceRequestsService;
  let prisma: {
    tenant: {
      serviceItem: {
        findUnique: ReturnType<typeof vi.fn>;
      };
      serviceRequest: {
        create: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        aggregate: ReturnType<typeof vi.fn>;
      };
    };
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        serviceItem: {
          findUnique: vi.fn(),
        },
        serviceRequest: {
          create: vi.fn(),
          findMany: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn(),
          aggregate: vi.fn(),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ServiceRequestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ServiceRequestsService);
  });

  describe('create', () => {
    it('should look up item price and compute chargeAmount = price * quantity', async () => {
      prisma.tenant.serviceItem.findUnique.mockResolvedValue(mockItem);
      prisma.tenant.serviceRequest.create.mockResolvedValue(mockRequest);

      const result = await service.create('hotel-1', 'res-1', {
        itemId: 'item-1',
        quantity: 2,
        notes: 'No onions',
      });

      expect(prisma.tenant.serviceItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
      expect(prisma.tenant.serviceRequest.create).toHaveBeenCalledWith({
        data: {
          reservationId: 'res-1',
          itemId: 'item-1',
          quantity: 2,
          notes: 'No onions',
          chargeAmount: 31.0,
          hotelId: 'hotel-1',
        },
        include: { item: true },
      });
      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException when item not found', async () => {
      prisma.tenant.serviceItem.findUnique.mockResolvedValue(null);

      await expect(
        service.create('hotel-1', 'res-1', {
          itemId: 'nonexistent',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status of existing request', async () => {
      prisma.tenant.serviceRequest.findUnique.mockResolvedValue(mockRequest);
      const updated = { ...mockRequest, status: 'COMPLETED' };
      prisma.tenant.serviceRequest.update.mockResolvedValue(updated);

      const result = await service.updateStatus('req-1', {
        status: 'COMPLETED',
      } as any);

      expect(prisma.tenant.serviceRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: { status: 'COMPLETED' },
        include: { item: true },
      });
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw NotFoundException when request not found', async () => {
      prisma.tenant.serviceRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent', { status: 'COMPLETED' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCharges', () => {
    it('should return aggregate total and list of requests', async () => {
      prisma.tenant.serviceRequest.aggregate.mockResolvedValue({
        _sum: { chargeAmount: 62.0 },
      });
      prisma.tenant.serviceRequest.findMany.mockResolvedValue([
        mockRequest,
        { ...mockRequest, id: 'req-2' },
      ]);

      const result = await service.getCharges('res-1');

      expect(result).toEqual({
        total: 62.0,
        requests: [mockRequest, { ...mockRequest, id: 'req-2' }],
      });
      expect(prisma.tenant.serviceRequest.aggregate).toHaveBeenCalledWith({
        where: { reservationId: 'res-1' },
        _sum: { chargeAmount: true },
      });
    });

    it('should return 0 total when no charges exist', async () => {
      prisma.tenant.serviceRequest.aggregate.mockResolvedValue({
        _sum: { chargeAmount: null },
      });
      prisma.tenant.serviceRequest.findMany.mockResolvedValue([]);

      const result = await service.getCharges('res-1');

      expect(result.total).toBe(0);
      expect(result.requests).toEqual([]);
    });
  });
});
