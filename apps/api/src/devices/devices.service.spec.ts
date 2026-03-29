import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-key'),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('DevicesService', () => {
  let service: DevicesService;

  const prisma = {
    device: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    tenant: {
      device: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [DevicesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(DevicesService);
  });

  describe('create', () => {
    it('should return device with apiKey', async () => {
      const dto = { serialNumber: 'SN-001', deviceModel: 'Pixel 8' };
      const created = { id: 'd1', ...dto, enrollmentCode: 'hashed-key' };
      prisma.device.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(prisma.device.create).toHaveBeenCalledWith({
        data: {
          serialNumber: 'SN-001',
          deviceModel: 'Pixel 8',
          enrollmentCode: 'hashed-key',
        },
      });
      expect(result).toHaveProperty('apiKey');
      expect(typeof result.apiKey).toBe('string');
      expect(result.apiKey).toHaveLength(64); // 32 bytes hex
      expect(result.id).toBe('d1');
    });
  });

  describe('findAll', () => {
    it('should call tenant.device.findMany without filter', async () => {
      const devices = [{ id: 'd1' }];
      prisma.tenant.device.findMany.mockResolvedValue(devices);

      const result = await service.findAll();

      expect(prisma.tenant.device.findMany).toHaveBeenCalledWith({
        where: undefined,
      });
      expect(result).toEqual(devices);
    });

    it('should call tenant.device.findMany with hotelId filter', async () => {
      prisma.tenant.device.findMany.mockResolvedValue([]);

      await service.findAll('hotel-1');

      expect(prisma.tenant.device.findMany).toHaveBeenCalledWith({
        where: { hotelId: 'hotel-1' },
      });
    });
  });

  describe('assign', () => {
    it('should update hotelId and status to ASSIGNED', async () => {
      const updated = { id: 'd1', hotelId: 'h1', status: 'ASSIGNED' };
      prisma.device.update.mockResolvedValue(updated);

      const result = await service.assign('d1', { hotelId: 'h1' });

      expect(prisma.device.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { hotelId: 'h1', status: 'ASSIGNED' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('unassign', () => {
    it('should set hotelId null and status UNASSIGNED', async () => {
      const updated = { id: 'd1', hotelId: null, status: 'UNASSIGNED' };
      prisma.device.update.mockResolvedValue(updated);

      const result = await service.unassign('d1');

      expect(prisma.device.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { hotelId: null, status: 'UNASSIGNED' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('heartbeat', () => {
    it('should throw UnauthorizedException for invalid token', async () => {
      const device = { id: 'd1', enrollmentCode: 'hashed' };
      prisma.device.findUnique.mockResolvedValue(device);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.heartbeat('d1', { batteryLevel: 80 }, 'bad-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      await expect(
        service.heartbeat('d1', { batteryLevel: 80 }, ''),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when device not found', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(
        service.heartbeat('d1', { batteryLevel: 80 }, 'token'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update lastHeartbeat for valid token', async () => {
      const device = { id: 'd1', enrollmentCode: 'hashed' };
      prisma.device.findUnique.mockResolvedValue(device);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const updated = { id: 'd1', lastHeartbeat: new Date() };
      prisma.device.update.mockResolvedValue(updated);

      const result = await service.heartbeat(
        'd1',
        { batteryLevel: 95, appVersion: '1.0.0' },
        'valid-token',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith('valid-token', 'hashed');
      expect(prisma.device.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: {
          lastHeartbeat: expect.any(Date),
          batteryLevel: 95,
          appVersion: '1.0.0',
        },
      });
      expect(result).toEqual(updated);
    });
  });
});
