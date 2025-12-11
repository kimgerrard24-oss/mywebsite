// file: src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret || secret.trim() === '') {
      throw new Error('JWT_ACCESS_SECRET is missing in environment');
    }

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        // ใช้ cookie เท่านั้น
        (req) => req?.cookies?.[process.env.ACCESS_TOKEN_COOKIE_NAME || 'phl_access'] || null,
      ]),
      secretOrKey: secret,
      ignoreExpiration: false,
    };

    super(options);
  }

  async validate(payload: any) {
    if (!payload || !payload.sub || !payload.jti) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    // ตรวจ Redis session (สำคัญมาก)
    const jti = payload.jti;
    const sessionKey = `session:access:${jti}`;

    const exists = await this.authService['redis'].exists(sessionKey);

    if (!exists) {
      throw new UnauthorizedException('Session not found or expired');
    }

    // คืนค่าให้ Passport → req.user
    return {
      userId: payload.sub,
      jti,
    };
  }
}
