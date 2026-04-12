import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
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
    reservation: {
      findFirst: vi.fn(),
      update: vi.fn(),
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

    it('should throw when device has no enrollmentCode', async () => {
      prisma.device.findUnique.mockResolvedValue({
        id: 'd1',
        enrollmentCode: null,
      });
      await expect(
        service.heartbeat('d1', { batteryLevel: 80 }, 'token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOne', () => {
    it('should return device when found', async () => {
      const device = { id: 'd1' };
      prisma.tenant.device.findUnique.mockResolvedValue(device);
      const result = await service.findOne('d1');
      expect(result).toEqual(device);
    });

    it('should throw NotFoundException when missing', async () => {
      prisma.tenant.device.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateDataUsage', () => {
    it('should throw when no token', async () => {
      await expect(service.updateDataUsage('d1', 10, '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when device not found', async () => {
      prisma.device.findUnique.mockResolvedValue(null);
      await expect(service.updateDataUsage('d1', 10, 'tok')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw when device has no enrollmentCode', async () => {
      prisma.device.findUnique.mockResolvedValue({
        id: 'd1',
        enrollmentCode: null,
      });
      await expect(service.updateDataUsage('d1', 10, 'tok')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when token invalid', async () => {
      prisma.device.findUnique.mockResolvedValue({
        id: 'd1',
        enrollmentCode: 'hashed',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      await expect(service.updateDataUsage('d1', 10, 'bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when no active reservation', async () => {
      prisma.device.findUnique.mockResolvedValue({
        id: 'd1',
        enrollmentCode: 'hashed',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.reservation.findFirst.mockResolvedValue(null);
      await expect(service.updateDataUsage('d1', 10, 'tok')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should disable hotspot when cap exceeded', async () => {
      prisma.device.findUnique.mockResolvedValue({
        id: 'd1',
        enrollmentCode: 'hashed',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.reservation.findFirst.mockResolvedValue({
        id: 'r1',
        hotspotEnabled: true,
        hotel: { hotspotDataCapMb: 100 },
      });
      prisma.reservation.update.mockResolvedValue({});

      const result = await service.updateDataUsage('d1', 150, 'tok');

      expect(result.hotspotEnabled).toBe(false);
      expect(result.dataUsedMb).toBe(150);
      expect(result.dataCapMb).toBe(100);
      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: { hotspotDataUsedMb: 150, hotspotEnabled: false },
      });
    });

    it('should keep hotspot enabled when under cap', async () => {
      prisma.device.findUnique.mockResolvedValue({
        id: 'd1',
        enrollmentCode: 'hashed',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.reservation.findFirst.mockResolvedValue({
        id: 'r1',
        hotspotEnabled: true,
        hotel: { hotspotDataCapMb: 100 },
      });
      prisma.reservation.update.mockResolvedValue({});

      const result = await service.updateDataUsage('d1', 50, 'tok');
      expect(result.hotspotEnabled).toBe(true);
    });

    it('should handle null hotspotDataCapMb', async () => {
      prisma.device.findUnique.mockResolvedValue({
        id: 'd1',
        enrollmentCode: 'hashed',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.reservation.findFirst.mockResolvedValue({
        id: 'r1',
        hotspotEnabled: true,
        hotel: { hotspotDataCapMb: null },
      });
      prisma.reservation.update.mockResolvedValue({});

      const result = await service.updateDataUsage('d1', 50, 'tok');
      expect(result.dataCapMb).toBe(null);
    });
  });

  describe('provision', () => {
    it('should throw when no token', async () => {
      await expect(service.provision('pt', '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when no device matches', async () => {
      prisma.device.findMany.mockResolvedValue([
        { id: 'd1', enrollmentCode: 'hashed' },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      await expect(service.provision('pt', 'bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when no reservation matches token', async () => {
      prisma.device.findMany.mockResolvedValue([
        { id: 'd1', enrollmentCode: 'hashed', hotelId: 'h1' },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.reservation.findFirst.mockResolvedValue(null);
      await expect(service.provision('pt', 'tok')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw when device hotel mismatch', async () => {
      prisma.device.findMany.mockResolvedValue([
        { id: 'd1', enrollmentCode: 'hashed', hotelId: 'h1' },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.reservation.findFirst.mockResolvedValue({
        id: 'r1',
        hotelId: 'h2',
      });
      await expect(service.provision('pt', 'tok')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should bind device to reservation on success', async () => {
      prisma.device.findMany.mockResolvedValue([
        { id: 'd1', enrollmentCode: 'hashed', hotelId: 'h1' },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.reservation.findFirst.mockResolvedValue({
        id: 'r1',
        hotelId: 'h1',
      });
      const updated = { id: 'r1', deviceId: 'd1' };
      prisma.reservation.update.mockResolvedValue(updated);

      const result = await service.provision('pt', 'tok');
      expect(prisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'r1' },
          data: expect.objectContaining({ deviceId: 'd1' }),
        }),
      );
      expect(result).toEqual(updated);
    });

    it('should skip devices with null enrollmentCode', async () => {
      prisma.device.findMany.mockResolvedValue([
        { id: 'd0', enrollmentCode: null },
        { id: 'd1', enrollmentCode: 'hashed', hotelId: 'h1' },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      prisma.reservation.findFirst.mockResolvedValue({
        id: 'r1',
        hotelId: 'h1',
      });
      prisma.reservation.update.mockResolvedValue({});
      await service.provision('pt', 'tok');
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });
});
