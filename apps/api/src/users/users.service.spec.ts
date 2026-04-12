import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed'), compare: vi.fn() },
  hash: vi.fn().mockResolvedValue('hashed'),
  compare: vi.fn(),
}));

const mockUser = {
  id: 'user-1',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'HOTEL_STAFF',
  hotelId: 'hotel-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('should hash password with bcrypt and create user', async () => {
      const dto = {
        email: 'jane@example.com',
        password: 'secret123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'HOTEL_STAFF',
        hotelId: 'hotel-1',
      };
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create(dto as any);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'jane@example.com',
          passwordHash: 'hashed',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'HOTEL_STAFF',
          hotelId: 'hotel-1',
        },
        select: expect.objectContaining({ id: true, email: true }),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto = {
        email: 'jane@example.com',
        password: 'secret123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'HOTEL_STAFF',
        hotelId: 'hotel-1',
      };
      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(dto as any)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all users for SUPER_ADMIN', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll({ role: 'SUPER_ADMIN' });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({ id: true, email: true }),
      });
      expect(result).toEqual([mockUser]);
    });

    it('should return same-hotel users only for HOTEL_STAFF', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll({
        role: 'HOTEL_STAFF',
        hotelId: 'hotel-1',
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { hotelId: 'hotel-1' },
        select: expect.objectContaining({ id: true, email: true }),
      });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return user without passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.objectContaining({ id: true, email: true }),
      });
      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('user-1');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.objectContaining({ id: true }),
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, firstName: 'Jan' });
      const result = await service.update('user-1', {
        firstName: 'Jan',
      } as any);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { firstName: 'Jan' },
        select: expect.objectContaining({ id: true }),
      });
      expect(result.firstName).toBe('Jan');
    });
  });
});
