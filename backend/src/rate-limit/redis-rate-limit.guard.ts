// ===============================================
// file: backend/src/rate-limit/redis-rate-limit.guard.ts
// ===============================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';

// ใช้ KEY จาก decorator (ไม่ประกาศใหม่)
import { RATE_LIMIT_CONTEXT_KEY } from '../common/rate-limit/rate-limit.decorator';

@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  private readonly limiter: RateLimiterRedis;

  constructor(private readonly reflector: Reflector) {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'phlyphant-redis',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
    });

    this.limiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rate-limit',
      points: 100,
      duration: 60,
      execEvenly: false,
      blockDuration: 0,
      inMemoryBlockOnConsumed: 0,
      inMemoryBlockDuration: 0,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // -------------------------------------------------
    // 1) อ่าน metadata จาก @RateLimitContext()
    // -------------------------------------------------
    const rateLimitContext = this.reflector.get<string>(
      RATE_LIMIT_CONTEXT_KEY,
      context.getHandler(),
    );

    // ไม่มี decorator → ไม่ตรวจ rate limit
    if (!rateLimitContext) {
      return true;
    }

    // -------------------------------------------------
    // 2) whitelist endpoint
    // -------------------------------------------------
    const url = request.url;
    const skipPaths = [
      '/health',
      '/system-check',
      '/auth/session-check',
      '/auth/google/callback',
      '/auth/facebook/callback',
    ];

    if (skipPaths.some((p) => url.startsWith(p))) {
      return true;
    }

    // -------------------------------------------------
    // 3) อ่าน IP (รองรับ Cloudflare)
    // -------------------------------------------------
    const ip =
      request.headers['cf-connecting-ip'] ||
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown';

    // -------------------------------------------------
    // 4) ตรวจ Rate Limit
    // key = context + IP
    // -------------------------------------------------
    try {
      const key = `${rateLimitContext}:${ip}`;
      await this.limiter.consume(key);
      return true;
    } catch (error: any) {
      throw new HttpException(
        {
          statusCode: 429,
          message: 'Too many requests. Please slow down.',
          retryAfter: error?.msBeforeNext
            ? Math.ceil(error.msBeforeNext / 1000)
            : undefined,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
