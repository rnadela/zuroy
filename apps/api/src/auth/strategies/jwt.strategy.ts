import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '@zuroy/shared';
import { JwtBlacklistService } from '../jwt-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly blacklist: JwtBlacklistService,
  ) {
    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    };
    super(options);
  }

  async validate(payload: JwtPayload) {
    if (payload.jti && (await this.blacklist.isBlacklisted(payload.jti))) {
      throw new UnauthorizedException('Token revoked');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      hotelId: payload.hotelId,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
