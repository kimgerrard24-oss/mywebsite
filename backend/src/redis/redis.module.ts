// ==========================================
// file: src/redis/redis.module.ts
// ==========================================

import {
  Global,
  Module,
  Inject,
  OnApplicationShutdown,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import type { Redis as RedisClient, RedisOptions } from 'ioredis';
import { RedisService } from './redis.service';

function getRedisConfig() {
  const url = process.env.REDIS_URL;
  const password = process.env.REDIS_PASSWORD;

  if (url && url.trim() !== '') {
    const parsed = new URL(url);
    const host = parsed.hostname;

    const envPort = Number(process.env.REDIS_PORT);
    const defaultPort =
      Number.isInteger(envPort) && envPort > 0 && envPort <= 65535
        ? envPort
        : undefined;

    const port = parsed.port ? Number(parsed.port) : defaultPort;

    if (
      port !== undefined &&
      (!Number.isInteger(port) || port <= 0 || port > 65535)
    ) {
      throw new Error(`Invalid Redis port value: ${parsed.port || envPort}`);
    }

    const finalPassword =
      parsed.password?.trim() || password || undefined;

    return {
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

        // ioredis auto-connects — do NOT call connect() manually
        const client = new Redis({
          host: cfg.host,
          port: cfg.port,
          password: cfg.password,
          ...options,
        });

        return client;
      },
    },

    RedisService,
  ],
  exports: [
    'REDIS_CLIENT',

    RedisService,
  ],
})
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisModule.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: RedisClient,
  ) {}

  async onApplicationShutdown() {
    try {
      await this.client.quit();
      this.logger.log('Redis client closed gracefully');
    } catch {
      this.logger.warn('Redis client quit() failed silently');
    }
  }
}
