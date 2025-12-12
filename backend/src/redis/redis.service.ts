// src/redis/redis.service.ts

import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Redis as RedisClient } from 'ioredis';

// Safe ENV loader (non-throwing for production stability)
function requireEnv(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    return null;
  }
  return value;
}

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  // Flags to avoid re-attaching listeners
  private static errorHandlersAttached = false;
  private static connectionHandlersAttached = false;

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: RedisClient,
    @Inject('REDIS_PUB') private readonly pubClient: RedisClient,
    @Inject('REDIS_SUB') private readonly subClient: RedisClient,
  ) {
    this.validateEnv();
    this.setupErrorHandling();
    this.setupConnectionHandlers();
  }

  private validateEnv() {
    const url = requireEnv('REDIS_URL');
    const host = requireEnv('REDIS_HOST');
    const port = requireEnv('REDIS_PORT');

    if (url) {
      try {
        const parsed = new URL(url);
        this.logger.log(
          `Redis endpoint detected: ${parsed.hostname}:${parsed.port || 6379}`
        );
      } catch {
        this.logger.log('Redis endpoint detected');
      }
      return;
    }

    if (host && port) {
      this.logger.log(`Redis endpoint detected: ${host}:${port}`);
      return;
    }

    this.logger.error(
      'Missing Redis configuration: expected REDIS_URL or REDIS_HOST/REDIS_PORT'
    );
  }

  private setupErrorHandling() {
    if (RedisService.errorHandlersAttached) {
      return;
    }
    RedisService.errorHandlersAttached = true;

    if (this.client) {
      this.client.on('error', (err: any) =>
        this.logger.error(`Redis CLIENT error: ${err?.message ?? String(err)}`)
      );
    }

    if (this.pubClient) {
      this.pubClient.on('error', (err: any) =>
        this.logger.error(`Redis PUB error: ${err?.message ?? String(err)}`)
      );
    }

    if (this.subClient) {
      this.subClient.on('error', (err: any) =>
        this.logger.error(`Redis SUB error: ${err?.message ?? String(err)}`)
      );
    }
  }

  private setupConnectionHandlers() {
    if (RedisService.connectionHandlersAttached) {
      return;
    }
    RedisService.connectionHandlersAttached = true;

    const log = (type: string) => (msg?: any) =>
      this.logger.log(`Redis ${type}: ${msg ?? 'connected'}`);

    if (this.client) {
      this.client.on('connect', log('CLIENT'));
      this.client.on('reconnecting', () =>
        this.logger.warn('Redis CLIENT reconnecting')
      );
    }

    if (this.pubClient) {
      this.pubClient.on('connect', log('PUB'));
      this.pubClient.on('reconnecting', () =>
        this.logger.warn('Redis PUB reconnecting')
      );
    }

    if (this.subClient) {
      this.subClient.on('connect', log('SUB'));
      this.subClient.on('reconnecting', () =>
        this.logger.warn('Redis SUB reconnecting')
      );
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.client) {
      this.logger.warn('Redis client not available - set ignored');
      return;
    }

    const serialized = JSON.stringify(value);

    try {
      if (ttlSeconds && Number.isFinite(ttlSeconds)) {
        await this.client.call('SET', key, serialized, 'EX', String(ttlSeconds));
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err: any) {
      this.logger.error(`Redis set error for key=${key}: ${err?.message ?? String(err)}`);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
  if (!this.client) {
    this.logger.warn('Redis client not available - get returns null');
    return null;
  }

  try {
    const value = await this.client.get(key);
    if (value === null) return null;

    // Return raw string — do NOT parse here
    return value as any;

  } catch (err: any) {
    this.logger.error(`Redis get error for key=${key}: ${err?.message ?? String(err)}`);
    return null;
  }
}


  async del(key: string): Promise<void> {
    if (!this.client) {
      this.logger.warn('Redis client not available - del ignored');
      return;
    }
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.error(`Redis del error: ${err?.message ?? String(err)}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Redis client not available - exists returns false');
      return false;
    }
    try {
      const res = await this.client.exists(key);
      return res === 1;
    } catch (err: any) {
      this.logger.error(`Redis exists error: ${err?.message ?? String(err)}`);
      return false;
    }
  }

  async hset(hash: string, key: string, value: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.hset(hash, key, value);
    } catch (err: any) {
      this.logger.error(`Redis hset error: ${err?.message ?? String(err)}`);
    }
  }

  async hget(hash: string, key: string): Promise<string | null> {
    if (!this.client) return null;

    try {
      return await this.client.hget(hash, key);
    } catch (err: any) {
      this.logger.error(`Redis hget error: ${err?.message ?? String(err)}`);
      return null;
    }
  }

  async hgetall(hash: string): Promise<Record<string, string>> {
    if (!this.client) return {};

    try {
      return await this.client.hgetall(hash);
    } catch (err: any) {
      this.logger.error(`Redis hgetall error: ${err?.message ?? String(err)}`);
      return {};
    }
  }

  async hincr(hash: string, key: string, amount = 1): Promise<number> {
    if (!this.client) {
      this.logger.warn('Redis client not available - hincr returns 0');
      return 0;
    }

    try {
      return await this.client.hincrby(hash, key, amount);
    } catch (err: any) {
      this.logger.error(`Redis hincr error: ${err?.message ?? String(err)}`);
      return 0;
    }
  }

  async publish(channel: string, message: any): Promise<void> {
    if (!this.pubClient) {
      this.logger.warn('Redis pub client not available - publish ignored');
      return;
    }

    const serialized = JSON.stringify(message);

    try {
      await this.pubClient.publish(channel, serialized);
    } catch (err: any) {
      this.logger.error(`Redis publish error: ${err?.message ?? String(err)}`);
    }
  }

  subscribe(channel: string, handler: (message: any) => void): void {
    if (!this.subClient) {
      this.logger.error('Redis sub client not available - subscribe failed');
      return;
    }

    try {
      this.subClient.subscribe(channel).catch((err: any) => {
        this.logger.error(`Failed to subscribe: ${err?.message ?? String(err)}`);
      });

      this.subClient.on('message', (chan: string, msg: string) => {
        if (chan !== channel) return;

        try {
          handler(JSON.parse(msg));
        } catch {
          handler(msg);
        }
      });
    } catch (err: any) {
      this.logger.error(`Redis subscribe setup error: ${err?.message ?? String(err)}`);
    }
  }

  async rateLimit(key: string, windowSec: number, max: number): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Redis client not available - rateLimit returns false');
      return false;
    }

    try {
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.expire(key, windowSec);
      }
      return count > max;
    } catch (err: any) {
      this.logger.error(`Redis rateLimit error: ${err?.message ?? String(err)}`);
      return false;
    }
  }

  async acquireLock(key: string, ttlSec = 5): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.call('SET', key, '1', 'NX', 'EX', String(ttlSec));
      return result === 'OK';
    } catch (err: any) {
      this.logger.error(`Redis acquireLock error for key=${key}: ${err?.message ?? String(err)}`);
      return false;
    }
  }

  async releaseLock(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.error(`Redis releaseLock error: ${err?.message ?? String(err)}`);
    }
  }

  async cache<T>(key: string, ttlSeconds: number, resolver: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await resolver();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Redis client not available - healthCheck returns false');
      return false;
    }

    try {
      const res = await this.client.ping();
      return typeof res === 'string'
        ? res.toUpperCase() === 'PONG'
        : Boolean(res);
    } catch (err: any) {
      this.logger.error(`Redis healthCheck error: ${err?.message ?? String(err)}`);
      return false;
    }
  }

  async deleteSessionByJti(jti: string): Promise<void> {
  if (!this.client) {
    this.logger.warn('Redis client not available - deleteSessionByJti ignored');
    return;
  }

  const key = `session:access:${jti}`;

  try {
    await this.client.del(key);
    this.logger.log(`Deleted access session key: ${key}`);
  } catch (err: any) {
    this.logger.error(`Redis deleteSessionByJti error: ${err?.message ?? String(err)}`);
  }
}

async deleteRefreshSession(refreshToken: string): Promise<void> {
  if (!this.client) {
    this.logger.warn('Redis client not available - deleteRefreshSession ignored');
    return;
  }

  const key = `session:refresh:${refreshToken}`;

  try {
    await this.client.del(key);
    this.logger.log(`Deleted refresh session key: ${key}`);
  } catch (err: any) {
    this.logger.error(`Redis deleteRefreshSession error: ${err?.message ?? String(err)}`);
  }
}

}
