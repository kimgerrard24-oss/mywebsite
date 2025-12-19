// backend/src/posts/cache/post-cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { postDetailCacheKey } from './post-cache-key.util';
import { PostDetailDto } from '../dto/post-detail.dto';

@Injectable()
export class PostCacheService {
  constructor(private readonly redis: RedisService) {}

  async get(postId: string): Promise<PostDetailDto | null> {
    const raw = await this.redis.get(
      postDetailCacheKey(postId),
    );

    return raw ? (JSON.parse(raw) as PostDetailDto) : null;
  }

  async set(postId: string, data: PostDetailDto): Promise<void> {
    // TTL = 60s (ผ่าน RedisService abstraction)
    await this.redis.set(
      postDetailCacheKey(postId),
      JSON.stringify(data),
      60,
    );
  }

  async invalidate(postId: string) {
  await this.redis.del(`post:${postId}`);
 }
}
