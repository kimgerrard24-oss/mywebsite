// backend/src/admin/appeals/admin-appeal-stats.cache.ts

import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AdminAppealStatsCache {
  private readonly TTL_SECONDS = 60;

  private readonly PREFIX =
    'admin:appeals:stats:';

  private readonly RANGES = [
    '24h',
    '7d',
    '30d',
  ] as const;

  constructor(
    private readonly redis: RedisService,
  ) {}

  async get<T = any>(key: string): Promise<T | null> {
    const val = await this.redis.getCache<string>(
      key,
    );

    if (!val) return null;

    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, data: any): Promise<void> {
    await this.redis.setCache(
      key,
      data,
      this.TTL_SECONDS,
    );
  }

  /**
   * Invalidate all appeal stats caches
   * (24h / 7d / 30d)
   *
   * Production-safe:
   * - no redis scan
   * - delete only known keys
   */
  async invalidateAll(): Promise<void> {
    const keys = this.RANGES.map(
      (r) => `${this.PREFIX}${r}`,
    );

    await this.redis.delMany(keys);
  }
}



