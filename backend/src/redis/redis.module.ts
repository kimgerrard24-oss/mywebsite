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

    const host = parsed.hostname;
    const rawPort = parsed.port;
    const port = rawPort ? parseInt(rawPort, 10) : 6379;

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error(`Invalid Redis port: ${rawPort}`);
    }

    const finalPassword =
      parsed.password && parsed.password.trim() !== ''
        ? parsed.password
        : password || undefined;

    return {
      type: 'host' as const,
      host,
      port,
      password: finalPassword,
    };
  }

  const host = process.env.REDIS_HOST;
  const rawPort = process.env.REDIS_PORT;

  if (!host || !rawPort) {
    throw new Error('Missing required REDIS_HOST or REDIS_PORT');
  }

  const port = parseInt(rawPort, 10);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid Redis port: ${rawPort}`);
  }

  return {
    type: 'host' as const,
    host,
    port,
    password: password || undefined,
  };
}

// ---------------------------------------------------------
// Build Redis Options
// ---------------------------------------------------------
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
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (): RedisClient => {
        const logger = new Logger('RedisModule');
        const cfg = getRedisConfig();
        const options = buildRedisOptions();

        logger.log(`REDIS_CLIENT connecting to: ${cfg.host}:${cfg.port}`);

        return new Redis({
          host: cfg.host,
          port: cfg.port,
          password: cfg.password,
          ...options,
        });
      },
    },

    {
      provide: 'REDIS_PUB',
      inject: ['REDIS_CLIENT'],
      useFactory: (client: RedisClient): RedisClient => {
        const options = buildRedisOptions();
        return client.duplicate({
          ...options,
          password: process.env.REDIS_PASSWORD || undefined,
        });
      },
    },

    {
      provide: 'REDIS_SUB',
      inject: ['REDIS_CLIENT'],
      useFactory: (client: RedisClient): RedisClient => {
        const options = buildRedisOptions();
        return client.duplicate({
          ...options,
          password: process.env.REDIS_PASSWORD || undefined,
        });
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
