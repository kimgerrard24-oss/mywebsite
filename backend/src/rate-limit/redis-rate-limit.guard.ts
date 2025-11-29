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

import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';

@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  private readonly limiter: RateLimiterRedis;

  constructor() {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'phlyphant-redis',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
      tls: undefined,
    });

    this.limiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rate-limit',
      points: 100,
      duration: 60,
      execEvenly: false,
      blockDuration: 0,

      // FIX: ต้องเขียนแบบนี้
      inMemoryBlockOnConsumed: 0,
      inMemoryBlockDuration: 0,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const ip =
      request.headers['cf-connecting-ip'] ||
      request.headers['x-real-ip'] ||
      request.headers['x-forwarded-for'] ||
      request.ip ||
      request.connection?.remoteAddress ||
      'unknown';

    try {
      await this.limiter.consume(ip);
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
