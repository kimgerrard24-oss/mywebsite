// file: src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret || secret.trim() === '') {
      throw new Error('JWT_ACCESS_SECRET is missing in environment');
    }

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1) Authorization: Bearer <token>
        ExtractJwt.fromAuthHeaderAsBearerToken(),

        // 2) Cookie: phl_access=<token>
        (req) => req?.cookies?.['phl_access'],
      ]),
      secretOrKey: secret,
      ignoreExpiration: false,
    };

    super(options);
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      jti: payload.jti || null,
    };
  }
}
