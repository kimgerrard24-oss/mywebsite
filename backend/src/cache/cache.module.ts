// ==============================
// file: src/app-cache/app-cache.module.ts
// ==============================
import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import RedisStore from 'cache-manager-redis-store';
import type RedisClientType from 'ioredis';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: ['REDIS_CLIENT'],
      useFactory: async (redisClient: RedisClientType): Promise<CacheModuleOptions> => {
        // If a Redis client instance is provided (from RedisModule), prefer reusing it.
        // cache-manager-redis-store supports passing a ready-made client via the "client" option.
        // Fallback: if no client is provided, use connection URL from env.
        const defaultTtl = Number(process.env.CACHE_TTL_SECONDS || '60');

        if (redisClient && typeof (redisClient as any).options === 'object') {
          return {
            store: RedisStore as unknown as any,
            ttl: defaultTtl,
            // the cache-manager redis store accepts "client" to reuse an existing ioredis instance
            // we cast to any because type definitions for cache-manager-redis-store are not strongly typed here
            client: redisClient as unknown as any,
          };
        }

        // Fallback to using connection URL from environment
        const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

        return {
          store: RedisStore as unknown as any,
          ttl: defaultTtl,
          url: redisUrl,
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class AppCacheModule {}
