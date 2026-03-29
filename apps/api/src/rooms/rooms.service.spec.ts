import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';

const mockRoom = {
  id: 'room-1',
  hotelId: 'hotel-1',
  number: '101',
  floor: 1,
  type: 'SINGLE',
};

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: {
    tenant: {
      room: {
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
        room: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [RoomsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RoomsService);
  });

  describe('findAll', () => {
    it('should return rooms via tenant.room.findMany', async () => {
      prisma.tenant.room.findMany.mockResolvedValue([mockRoom]);

      const result = await service.findAll();

      expect(prisma.tenant.room.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockRoom]);
    });
  });

  describe('findOne', () => {
    it('should return room by id', async () => {
      prisma.tenant.room.findUnique.mockResolvedValue(mockRoom);

      const result = await service.findOne('room-1');

      expect(prisma.tenant.room.findUnique).toHaveBeenCalledWith({
        where: { id: 'room-1' },
      });
      expect(result).toEqual(mockRoom);
    });

    it('should throw NotFoundException when room not found', async () => {
      prisma.tenant.room.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create room with hotelId', async () => {
      const dto = { number: '101', floor: 1, type: 'SINGLE' };
      prisma.tenant.room.create.mockResolvedValue(mockRoom);

      const result = await service.create('hotel-1', dto as any);

      expect(prisma.tenant.room.create).toHaveBeenCalledWith({
        data: { ...dto, hotelId: 'hotel-1' },
      });
      expect(result).toEqual(mockRoom);
    });
  });

  describe('update', () => {
    it('should update room', async () => {
      const dto = { number: '102' };
      prisma.tenant.room.findUnique.mockResolvedValue(mockRoom);
      prisma.tenant.room.update.mockResolvedValue({
        ...mockRoom,
        number: '102',
      });

      const result = await service.update('room-1', dto as any);

      expect(prisma.tenant.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: dto,
      });
      expect(result.number).toBe('102');
    });
  });

  describe('remove', () => {
    it('should delete room', async () => {
      prisma.tenant.room.findUnique.mockResolvedValue(mockRoom);
      prisma.tenant.room.delete.mockResolvedValue(mockRoom);

      const result = await service.remove('room-1');

      expect(prisma.tenant.room.delete).toHaveBeenCalledWith({
        where: { id: 'room-1' },
      });
      expect(result).toEqual(mockRoom);
    });
  });
});
