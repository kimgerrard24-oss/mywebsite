// ==========================================
// file: src/redis/redis.module.ts
// ==========================================

import { Global, Module, Inject, OnApplicationShutdown, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import type { Redis as RedisClient, RedisOptions } from 'ioredis';

// ---------------------------------------------------------
// Resolve Redis configuration from ENV
// ---------------------------------------------------------
function getRedisConfig() {
  const url = process.env.REDIS_URL;
  const password = process.env.REDIS_PASSWORD;

  if (url && url.trim() !== '') {
    const parsed = new URL(url);

    if (password && !parsed.password) {
      parsed.password = password;
    }

    return { type: 'url' as const, url: parsed.toString() };
  }

  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;

  if (!host || !port) {
    throw new Error('Missing required REDIS_HOST or REDIS_PORT');
  }

  return {
    type: 'host' as const,
    host,
    port: Number(port),
    password: password || undefined,
  };
}

// ---------------------------------------------------------
// Build Redis Options
// ---------------------------------------------------------
function buildRedisOptions(): RedisOptions {
  return {
    enableReadyCheck: true,
    lazyConnect: true, // changed from false to prevent premature connections
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      return Math.min(times * 100, 2000);
    },
  };
}

@Global()
@Module({
  providers: [
    // -----------------------------------------------------
    // Main Redis Client
    // -----------------------------------------------------
    {
      provide: 'REDIS_CLIENT',
      useFactory: (): RedisClient => {
        const logger = new Logger('RedisModule');
        const cfg = getRedisConfig();
        const options = buildRedisOptions();

        if (cfg.type === 'url') {
          const u = new URL(cfg.url);
          logger.log(`REDIS_CLIENT connecting to: ${u.hostname}:${u.port || 6379}`);
          return new Redis(cfg.url, options);
        }

        logger.log(`REDIS_CLIENT connecting to: ${cfg.host}:${cfg.port}`);

        return new Redis(
          {
            host: cfg.host,
            port: cfg.port,
            password: cfg.password,
            ...options,
          }
        );
      },
    },

    // -----------------------------------------------------
    // Redis Publisher
    // -----------------------------------------------------
    {
      provide: 'REDIS_PUB',
      inject: ['REDIS_CLIENT'],
      useFactory: (client: RedisClient): RedisClient => {
        return client.duplicate(buildRedisOptions());
      },
    },

    // -----------------------------------------------------
    // Redis Subscriber
    // -----------------------------------------------------
    {
      provide: 'REDIS_SUB',
      inject: ['REDIS_CLIENT'],
      useFactory: (client: RedisClient): RedisClient => {
        return client.duplicate(buildRedisOptions());
      },
    },
  ],
  exports: ['REDIS_CLIENT', 'REDIS_PUB', 'REDIS_SUB'],
})
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisModule.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: RedisClient,
    @Inject('REDIS_PUB') private readonly pubClient: RedisClient,
    @Inject('REDIS_SUB') private readonly subClient: RedisClient,
  ) {}

  async onApplicationShutdown() {
    try {
      await this.client.quit();
      await this.pubClient.quit();
      await this.subClient.quit();
      this.logger.log('All Redis clients closed gracefully');
    } catch {
      this.logger.warn('Redis clients quit() failed silently');
    }
  }
}
