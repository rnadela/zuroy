import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtBlacklistService } from './jwt-blacklist.service';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn(),
  },
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  firstName: 'John',
  lastName: 'Doe',
  role: 'HOTEL_STAFF',
  hotelId: 'hotel-1',
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: JwtBlacklistService, useValue: { blacklist: vi.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('should return JWT for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'HOTEL_STAFF',
          hotelId: 'hotel-1',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: 'test@example.com',
          role: 'HOTEL_STAFF',
          hotelId: 'hotel-1',
        }),
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for nonexistent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@example.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user with hashed password and return auth response', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'secret123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed-password',
          firstName: 'John',
          lastName: 'Doe',
          role: 'HOTEL_STAFF',
        },
      });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'secret123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('logout', () => {
    it('should blacklist jti when ttl is positive', async () => {
      const blacklist = vi.fn();
      (
        service as unknown as { blacklist: { blacklist: typeof blacklist } }
      ).blacklist = {
        blacklist,
      };
      const exp = Math.floor(Date.now() / 1000) + 3600;
      await service.logout('jti-1', exp);
      expect(blacklist).toHaveBeenCalled();
    });

    it('should not blacklist when ttl is zero or negative', async () => {
      const blacklist = vi.fn();
      (
        service as unknown as { blacklist: { blacklist: typeof blacklist } }
      ).blacklist = {
        blacklist,
      };
      const exp = Math.floor(Date.now() / 1000) - 10;
      await service.logout('jti-1', exp);
      expect(blacklist).not.toHaveBeenCalled();
    });
  });
});
