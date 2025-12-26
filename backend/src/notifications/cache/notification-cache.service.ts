// backend/src/notifications/cache/notification-cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class NotificationCacheService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  private buildKey(
    userId: string,
    cursor: string | null,
  ) {
    return `cache:notifications:${userId}:${cursor ?? 'first'}`;
  }

  async get(userId: string, cursor: string | null) {
    try {
      const key = this.buildKey(userId, cursor);
      return await this.redis.getCache(key);
    } catch {
      return null;
    }
  }

  async set(
    userId: string,
    cursor: string | null,
    value: unknown,
  ) {
    try {
      const key = this.buildKey(userId, cursor);
      await this.redis.setCache(key, value, 30); // 30s cache only
    } catch {
      // fail-soft
    }
  }

  async invalidateList(userId: string): Promise<void> {
    try {
      // ลบเฉพาะหน้าแรก (พอสำหรับ UX)
      await this.redis.delMany([
        this.buildKey(userId, null),
      ]);
    } catch {
      // fail-soft
    }
  }
}
