// src/common/rate-limit/rate-limit-service.ts

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
        });

        this.limiters.set(action as RateLimitAction, limiter);
      });

      this.logger.log(
        `RateLimitService initialized (${this.limiters.size} policies loaded)`,
      );
    } catch (err) {
      this.logger.error(
        'Failed to initialize rate limiters',
        err instanceof Error ? err.message : err,
      );
      throw err;
    }
  }

  private sanitizeKey(raw: string): string {
    if (!raw) return 'unknown';

    let key = String(raw).trim();

    // IPv6 mapped prefix
    key = key.replace(/^::ffff:/, '');

    // remove port
    key = key.replace(/:\d+$/, '');

    // extract IPv4 if present
    const ipv4 = key.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
    if (ipv4 && ipv4[0]) {
      key = ipv4[0];
    }

    // normalize
    key = key.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (!key.length) {
      return 'unknown';
    }

    return key;
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

    const sanitizedKey = this.sanitizeKey(key);

    this.logger.debug(
      `Consume: action="${action}", raw="${key}", sanitized="${sanitizedKey}"`,
    );

    try {
      const result = await limiter.consume(sanitizedKey);
      const resetSec = Math.ceil(result.msBeforeNext / 1000);

      return {
        limit: limiter.points,
        remaining: result.remainingPoints,
        retryAfterSec: 0,
        reset: resetSec,
      };
    } catch (err: any) {
      const retryAfterSec =
        err?.msBeforeNext ? Math.ceil(err.msBeforeNext / 1000) : 60;

      this.logger.warn(
        `Rate limit exceeded for action="${action}", key="${sanitizedKey}", retryAfterSec=${retryAfterSec}`,
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
      // nothing to clean
    } catch (err) {
      this.logger.error('Error during RateLimitService shutdown', err as any);
    }
  }
}
