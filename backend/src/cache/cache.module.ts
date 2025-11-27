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
        const defaultTtl = Number(process.env.CACHE_TTL_SECONDS || '60');

        // ------------------------------------------
        // Case 1: ใช้ redis client จาก DI ตามปกติ
        // ------------------------------------------
        if (redisClient && typeof (redisClient as any).options === 'object') {
          return {
            store: RedisStore as unknown as any,
            ttl: defaultTtl,
            client: redisClient as unknown as any,
          };
        }

        // ------------------------------------------
        // Case 2: ไม่มี client → fallback ใช้ REDIS_URL
        // แต่ต้อง parse เป็น host/port เท่านั้น
        // ------------------------------------------
        const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

        let host = 'redis';
        let port = 6379;

        try {
          const parsed = new URL(redisUrl);
          host = parsed.hostname;
          port = Number(parsed.port) || 6379;
        } catch {
          // ใช้ค่า default
        }

        return {
          store: RedisStore as unknown as any,
          ttl: defaultTtl,
          socket: {
            host,
            port,
          },
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class AppCacheModule {}
