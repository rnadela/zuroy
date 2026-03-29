import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtBlacklistService {
  private readonly PREFIX = 'jwt:blacklist:';

  constructor(private readonly redis: RedisService) {}

  async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`${this.PREFIX}${jti}`, '1', 'EX', ttlSeconds);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redis.get(`${this.PREFIX}${jti}`);
    return result !== null;
  }
}
