// src/common/rate-limit/rate-limit.service.ts
import { Injectable, Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import { RateLimitAction, RateLimitPolicy } from './rate-limit.policy';

/**
 * RateLimitService
 *
 * - สร้าง RateLimiterRedis สำหรับแต่ละ action จาก RateLimitPolicy
 * - ใช้ Redis client ที่ถูก inject มา (ชื่อ token: 'REDIS_CLIENT')
 * - ฟังก์ชัน consume จะโยน error ที่มาจาก rate-limiter-flexible เมื่อติด limit
 *
 * หมายเหตุ: ห้ามใส่ค่า secret/credential ลงในไฟล์นี้ — ใช้ env/GitHub Secrets/AWS Secrets Manager แทน
 */
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
          // blockDuration: seconds to block after consuming all points (min 60s)
          blockDuration: Math.max(config.duration, 60),
        });

        this.limiters.set(action as RateLimitAction, limiter);
      });

      this.logger.log(
        `RateLimitService initialized (${this.limiters.size} policies loaded)`,
      );
    } catch (err) {
      this.logger.error('Failed to initialize rate limiters', err as any);
      // Rethrow so the application fails fast if rate limiter cannot initialize
      throw err;
    }
  }

  /**
   * consume
   * - action: name of the RateLimitAction
   * - key: identifier (IP, userId, socketId, etc.)
   *
   * Throws the original error from rate-limiter-flexible when limit is exceeded.
   */
  async consume(action: RateLimitAction, key: string) {
    const limiter = this.limiters.get(action);

    if (!limiter) {
      this.logger.warn(`RateLimitPolicy not found for action="${action}"`);
      return;
    }

    try {
      await limiter.consume(key);
    } catch (err) {
      // Log information for monitoring/alerts
      this.logger.warn(
        `Rate limit exceeded for action="${action}", key="${key}"`,
      );
      // Re-throw to be handled by caller (guard/controller)
      throw err;
    }
  }

  /**
   * Optional cleanup if the injected redis client needs explicit shutdown handling.
   */
  async onModuleDestroy() {
    try {
      // Do not close injected client here unless you know it's owned by this module.
      // If you DO want to close it, uncomment the following lines:
      //
      // await this.redis.quit();
      // this.logger.log('Redis client closed by RateLimitService');
    } catch (err) {
      this.logger.error('Error during RateLimitService shutdown', err as any);
    }
  }
}
