// backend/src/follows/cache/follow-cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class FollowCacheService {
  constructor(private readonly redis: RedisService) {}

  async invalidateCounts(userIds: string[]) {
    const keys = userIds.flatMap((id) => [
      `user:${id}:followers:count`,
      `user:${id}:following:count`,
    ]);

    if (keys.length > 0) {
      await this.redis.delMany(keys);
    }
  }
}
