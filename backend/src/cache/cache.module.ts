// ==============================
// file: src/cache/cache.module.ts
// ==============================

import { Module, Global } from '@nestjs/common';
import {
  CacheModule as NestCacheModule,
  CacheModuleOptions,
} from '@nestjs/cache-manager';
import RedisStore from 'cache-manager-redis-store';
import type { Redis as RedisClient, RedisOptions } from 'ioredis';

// ใช้ options แบบเดียวกับ RedisModule
function buildRedisOptions(): RedisOptions {
  return {
    enableReadyCheck: true,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      return Math.min(times * 100, 2000);
    },
  };
}

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: ['REDIS_CLIENT'],
      useFactory: async (
        redisClient: RedisClient,
      ): Promise<CacheModuleOptions> => {
        const defaultTtl = Number(process.env.CACHE_TTL_SECONDS || '60');

        // ใช้ duplicate() เพื่อหลีกเลี่ยงการเชื่อมต่อซ้ำบน client ตัวหลัก
        const cacheClient = redisClient.duplicate(buildRedisOptions());

        return {
          store: RedisStore as any,
          ttl: defaultTtl,
          client: cacheClient as any,
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class AppCacheModule {}
