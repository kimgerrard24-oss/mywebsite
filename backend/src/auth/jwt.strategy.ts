// src/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { RedisService } from '../redis/redis.service';
import { ACCESS_TOKEN_KEY_PREFIX } from './session/session.constants';

/**
 * JWT Strategy with Redis Session Validation
 * 
 * Flow:
 * 1. Extract JWT from cookie 'phl_access'
 * 2. Verify JWT signature using JWT_ACCESS_SECRET
 * 3. Validate Redis session pointer (session:access:{jti})
 * 4. Return user data if valid
 * 
 * Security:
 * - JWT alone is not enough (stateless)
 * - Redis check prevents token reuse after logout/revoke
 * - Short-lived token (15 min default)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.['phl_access'];
          
          if (!token) {
            this.logger.warn('Access token cookie not found');
          }
          
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate JWT payload + Redis session
   * 
   * Called after JWT signature is verified
   * 
   * @param payload - Decoded JWT payload { sub, jti, iat, exp }
   * @returns User object for request.user
   * @throws UnauthorizedException if session invalid
   */
  async validate(payload: any) {
    const { sub, jti } = payload;

    this.logger.debug(`Validating JWT: sub=${sub}, jti=${jti}`);

    // 1. ตรวจสอบว่า payload มี sub และ jti
    if (!sub || !jti) {
      this.logger.warn('Invalid JWT payload: missing sub or jti');
      throw new UnauthorizedException('Invalid token payload');
    }

    // 2. ตรวจสอบ Redis session pointer
    const redisKey = `${ACCESS_TOKEN_KEY_PREFIX}${jti}`;
    
    try {
      const sessionJson = await this.redisService.get(redisKey);

      if (!sessionJson) {
        this.logger.warn(`Session not found or expired for jti: ${jti}`);
        throw new UnauthorizedException('Session expired or revoked');
      }

      // 3. Parse session data
      let session;
      try {
        session = JSON.parse(sessionJson);
      } catch (e) {
        this.logger.error(`Failed to parse session data for jti: ${jti}`, e);
        throw new UnauthorizedException('Invalid session data');
      }

      // 4. ตรวจสอบว่า session มี userId
      if (!session || !session.userId) {
        this.logger.warn(`Invalid session structure for jti: ${jti}`);
        throw new UnauthorizedException('Invalid session data');
      }

      // 5. ตรวจสอบว่า userId ใน session ตรงกับ sub ใน JWT
      if (session.userId !== sub) {
        this.logger.error(
          `User ID mismatch: JWT sub=${sub}, session userId=${session.userId}`,
        );
        throw new UnauthorizedException('Session data mismatch');
      }

      this.logger.debug(`✅ Session validated successfully for user: ${sub}`);

      // Return user object → จะถูกใส่ใน request.user
      return {
        userId: sub,
        jti: jti,
      };
      
    } catch (error) {
      // Redis error or session validation error
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      this.logger.error(`Redis validation error for jti: ${jti}`, error);
      throw new UnauthorizedException('Session validation failed');
    }
  }
}