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
            keyPrefix: 'rl',
            points: config.max,
            duration: config.windowSec,
            blockDuration: config.blockDurationSec,

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

    let k = raw.trim()
      .replace(/^::ffff:/, '')
      .replace(/:\d+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    return k || 'unknown';
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

    const ipSanitized = this.sanitizeKey(key);

    const fullKey = `${action}:${ipSanitized}`;

    this.logger.debug(
      `Consume: action="${action}", raw="${key}", sanitized="${fullKey}"`,
    );

    try {
      const result = await limiter.consume(fullKey);
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
        `Rate limit exceeded for action="${action}", key="${fullKey}", retryAfterSec=${retryAfterSec}`,
      );

      return Promise.reject({
        limit: limiter.points,
        remaining: 0,
        retryAfterSec,
        reset: retryAfterSec,
      });
    }
  }

  async reset(action: RateLimitAction, key: string): Promise<void> {
    const limiter = this.limiters.get(action);
    if (!limiter) return;

    const ipSanitized = this.sanitizeKey(key);

    const fullKey = `${action}:${ipSanitized}`;

    try {
      await limiter.delete(fullKey);
      this.logger.debug(
        `RateLimit reset: action="${action}", key="${fullKey}"`,
      );
    } catch {
      this.logger.warn(
        `Failed to reset limiter key="${fullKey}" for action="${action}"`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      // nothing to clean
    } catch (err) {
      this.logger.error('Error during RateLimitService shutdown', err as any);
    }
  }

 async check(action: RateLimitAction, key: string) {
  const { points, duration, blockDuration } = RateLimitPolicy[action];


  const fullKey = `${action}:${key}`;

  // 1) block key (rl:block:action:key)
  const blockKey = `rl:block:${fullKey}`;

  // if already blocked → return retryAfter
  const ttl = await this.redis.ttl(blockKey);

  if (ttl > 0) {
    return {
      blocked: true,
      retryAfterSec: ttl,
    };
  }

  // 2) usage key (rl:action:key)
  const usageKey = `rl:${fullKey}`;

  // get current usage
  const count = Number(await this.redis.get(usageKey)) || 0;

  if (count >= points) {
    // set block
    if (blockDuration) {
      await this.redis.setex(blockKey, blockDuration, '1');
    }

    return {
      blocked: true,
      retryAfterSec: blockDuration || duration,
    };
  }

  // ok
  return {
    blocked: false,
  };
}

}
