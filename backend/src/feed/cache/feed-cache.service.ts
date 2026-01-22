// backend/src/feed/cache/feed-cache.service.ts

import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class FeedCacheService {
  constructor(private readonly redis: RedisService) {}

  private key(cursor: string | null) {
    return `cache:feed:${cursor ?? 'first'}`;
  }

  /**
   * Cache is NOT authority
   * - best-effort
   * - fail-soft
   */
  async get<T = any>(cursor: string | null): Promise<T | null> {
    const raw = await this.redis.getCache<string>(this.key(cursor));
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Short TTL only
   * - never extend TTL
   * - cache only
   */
  async set(cursor: string | null, value: any): Promise<void> {
    try {
      await this.redis.setCache(
        this.key(cursor),
        JSON.stringify(value),
        30, // seconds — short TTL
      );
    } catch {
      // fail-soft: cache must not break feed
    }
  }

  /**
   * Optional: invalidate first page when new post created
   */
  async invalidateFirstPage(): Promise<void> {
    try {
      await this.redis.del(`cache:feed:first`);
    } catch {
      // fail-soft
    }
  }

  async invalidateByUser(userId: string): Promise<void> {
  // best-effort cache invalidation
  try {
    const pattern = `cache:feed:*:${userId}`;
    // ถ้าคุณไม่มี key pattern แบบนี้ ให้ปล่อย noop
  } catch {
    // fail-soft
  }
 }
}
