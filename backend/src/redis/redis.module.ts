// ==========================================
// file: src/redis/redis.module.ts
// ==========================================

import { Global, Module, Inject, OnApplicationShutdown, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import type { Redis as RedisClient, RedisOptions } from 'ioredis';

// ---------------------------------------------------------
// Safe ENV loader (Production Safety)
// ---------------------------------------------------------
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// ---------------------------------------------------------
// Build production-grade Redis Options
// ---------------------------------------------------------
function buildRedisOptions(): RedisOptions {
  const options: RedisOptions = {
    enableReadyCheck: true,
    lazyConnect: false,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      return Math.min(times * 100, 2000);
    },
  };

  if (process.env.REDIS_PASSWORD) {
    options.password = process.env.REDIS_PASSWORD;
  }

  return options;
}

@Global()
@Module({
  providers: [
    // -----------------------------------------------------
    // Main Redis Client (Used for cache, lock, rate limit)
    // -----------------------------------------------------
    {
      provide: 'REDIS_CLIENT',
      useFactory: (): RedisClient => {
        const logger = new Logger('RedisModule');
        const url = requireEnv('REDIS_URL'); // production-safe

        logger.log(`REDIS_CLIENT connecting to: ${url}`);

        return new Redis(url, buildRedisOptions());
      },
    },

    // -----------------------------------------------------
    // Redis Publisher (Pub/Sub)
    // -----------------------------------------------------
    {
      provide: 'REDIS_PUB',
      useFactory: (): RedisClient => {
        const url = requireEnv('REDIS_URL');

        return new Redis(url, {
          ...buildRedisOptions(),
          maxRetriesPerRequest: null,
        });
      },
    },

    // -----------------------------------------------------
    // Redis Subscriber (Pub/Sub)
    // -----------------------------------------------------
    {
      provide: 'REDIS_SUB',
      useFactory: (): RedisClient => {
        const url = requireEnv('REDIS_URL');

        return new Redis(url, {
          ...buildRedisOptions(),
          maxRetriesPerRequest: null,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT', 'REDIS_PUB', 'REDIS_SUB'],
})
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisModule.name);

  constructor(@Inject('REDIS_CLIENT') private readonly client: RedisClient) {}

  // ---------------------------------------------------------
  // Graceful Shutdown (Avoid zombie Redis connections)
  // ---------------------------------------------------------
  async onApplicationShutdown() {
    try {
      await this.client.quit();
      this.logger.log('Redis client closed gracefully');
    } catch {
      this.logger.warn('Redis client quit() failed silently');
    }
  }
}
