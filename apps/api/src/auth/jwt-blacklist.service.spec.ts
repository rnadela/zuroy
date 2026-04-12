import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { JwtBlacklistService } from './jwt-blacklist.service';
import { RedisService } from '../redis/redis.service';

describe('JwtBlacklistService', () => {
  let service: JwtBlacklistService;
  const redis = { set: vi.fn(), get: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        JwtBlacklistService,
        { provide: RedisService, useValue: redis },
      ],
    }).compile();
    service = module.get(JwtBlacklistService);
  });

  it('should blacklist a jti with TTL', async () => {
    await service.blacklist('jti-1', 3600);
    expect(redis.set).toHaveBeenCalledWith(
      'jwt:blacklist:jti-1',
      '1',
      'EX',
      3600,
    );
  });

  it('should return true when jti is blacklisted', async () => {
    redis.get.mockResolvedValue('1');
    const result = await service.isBlacklisted('jti-1');
    expect(redis.get).toHaveBeenCalledWith('jwt:blacklist:jti-1');
    expect(result).toBe(true);
  });

  it('should return false when jti is not blacklisted', async () => {
    redis.get.mockResolvedValue(null);
    const result = await service.isBlacklisted('jti-1');
    expect(result).toBe(false);
  });
});
