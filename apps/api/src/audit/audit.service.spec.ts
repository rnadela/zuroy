import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditService', () => {
  let service: AuditService;

  const prisma = {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(AuditService);
  });

  describe('log', () => {
    it('should create an audit entry', async () => {
      prisma.auditLog.create.mockResolvedValue(undefined);

      const entry = {
        actorId: 'u1',
        actorEmail: 'admin@zuroy.com',
        actorRole: 'SUPER_ADMIN',
        action: 'CREATE',
        resource: 'Hotel',
        resourceId: 'h1',
        hotelId: 'h1',
        metadata: { name: 'Test Hotel' },
        ipAddress: '127.0.0.1',
      };

      await service.log(entry);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({ data: entry });
    });

    it('should create audit entry with minimal fields', async () => {
      prisma.auditLog.create.mockResolvedValue(undefined);

      const entry = { action: 'LOGIN', resource: 'Auth' };

      await service.log(entry);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({ data: entry });
    });
  });

  describe('findByResource', () => {
    it('should query by resource and resourceId', async () => {
      const logs = [{ id: 'log1', resource: 'Hotel', resourceId: 'h1' }];
      prisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.findByResource('Hotel', 'h1');

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { resource: 'Hotel', resourceId: 'h1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(logs);
    });
  });

  describe('findByHotel', () => {
    it('should query by hotelId', async () => {
      const logs = [{ id: 'log1', hotelId: 'h1' }];
      prisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await service.findByHotel('h1');

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { hotelId: 'h1' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      expect(result).toEqual(logs);
    });
  });

  describe('findByActor', () => {
    it('should query by actorId', async () => {
      const logs = [{ id: 'log1', actorId: 'u1' }];
      prisma.auditLog.findMany.mockResolvedValue(logs);
      const result = await service.findByActor('u1');
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { actorId: 'u1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(logs);
    });
  });
});
