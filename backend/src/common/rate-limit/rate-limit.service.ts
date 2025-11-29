// src/common/rate-limit/rate-limit.service.ts
import { Injectable, Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import { RateLimitAction, RateLimitPolicy } from './rate-limit.policy';

export interface RateLimitConsumeResult {
  limit: number;
  remaining: number;
  retryAfterSec: number;
  reset: number;
}

@Injectable()
export class RateLimitService implements OnModuleDestroy {
  private readonly logger = new Logger(RateLimitService.name);

  private limiters: Map<RateLimitAction, RateLimiterRedis> = new Map();

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {
    try {
      Object.entries(RateLimitPolicy).forEach(([action, config]) => {
        const limiter = new RateLimiterRedis({
          storeClient: this.redis,
          keyPrefix: `rl:${action}`,
          points: config.points,
          duration: config.duration,
          blockDuration: 0,
          execEvenly: false,
          inMemoryBlockOnConsumed: 0,
          inMemoryBlockDuration: 0,
          insuranceLimiter: undefined,
        });

        this.limiters.set(action as RateLimitAction, limiter);
      });

      this.logger.log(
        `RateLimitService initialized (${this.limiters.size} policies loaded)`,
      );
    } catch (err) {
      this.logger.error('Failed to initialize rate limiters', err as any);
      throw err;
    }
  }

  async consume(
    action: RateLimitAction,
    key: string,
  ): Promise<RateLimitConsumeResult> {
    const limiter = this.limiters.get(action);

    if (!limiter) {
      this.logger.warn(`RateLimitPolicy not found for action="${action}"`);
      return {
        limit: 0,
        remaining: 0,
        retryAfterSec: 0,
        reset: 0,
      };
    }

    try {
      const result = await limiter.consume(key);

      const resetSec = Math.ceil(result.msBeforeNext / 1000);

      return {
        limit: limiter.points,
        remaining: result.remainingPoints,
        retryAfterSec: 0,
        reset: resetSec,
      };
    } catch (err: any) {
      const retryAfterSec = err?.msBeforeNext
        ? Math.ceil(err.msBeforeNext / 1000)
        : 60;

      this.logger.warn(
        `Rate limit exceeded for action="${action}", key="${key}", retryAfterSec=${retryAfterSec}`,
      );

      return Promise.reject({
        limit: limiter.points,
        remaining: 0,
        retryAfterSec,
        reset: retryAfterSec,
      });
    }
  }

  async onModuleDestroy() {
    try {
      // ไม่มี resource ให้ cleanup
    } catch (err) {
      this.logger.error('Error during RateLimitService shutdown', err as any);
    }
  }
}
