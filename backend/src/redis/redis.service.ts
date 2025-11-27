// src/redis/redis.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis as RedisClient } from 'ioredis';

// ---------------------------------------------------------
// Safe ENV loader (non-throwing for production stability)
// ---------------------------------------------------------
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

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: RedisClient,
    @Inject('REDIS_PUB') private readonly pubClient: RedisClient,
    @Inject('REDIS_SUB') private readonly subClient: RedisClient,
  ) {
    this.validateEnv();
    this.setupErrorHandling();
    this.setupConnectionHandlers();
  }

  // ---------------------------------------------------------
  // Environment validation
  // ---------------------------------------------------------
  private validateEnv() {
    const redisUrl = requireEnv('REDIS_URL');

    if (!redisUrl) {
      this.logger.error('REDIS_URL is missing. Check backend/.env.production or DI for REDIS_CLIENT.');
    } else {
      try {
        const normalized = redisUrl.replace(/^redis:\/\//, '');
        const hostPort = normalized.split('@').pop()?.split('/')[0] || normalized.split('/')[0];
        this.logger.log(`Redis endpoint detected: ${hostPort}`);
      } catch {
        this.logger.log('Redis endpoint detected');
      }
    }
  }

  // ---------------------------------------------------------
  // Global Error Handling
  // ---------------------------------------------------------
  private setupErrorHandling() {
    if (this.client) {
      this.client.on('error', (err: any) =>
        this.logger.error(`Redis CLIENT error: ${err?.message ?? String(err)}`),
      );
    }

    if (this.pubClient) {
      this.pubClient.on('error', (err: any) =>
        this.logger.error(`Redis PUB error: ${err?.message ?? String(err)}`),
      );
    }

    if (this.subClient) {
      this.subClient.on('error', (err: any) =>
        this.logger.error(`Redis SUB error: ${err?.message ?? String(err)}`),
      );
    }
  }

  // ---------------------------------------------------------
  // Connection Handlers
  // ---------------------------------------------------------
  private setupConnectionHandlers() {
    const log = (type: string) => (msg?: any) =>
      this.logger.log(`Redis ${type}: ${msg ?? 'connected'}`);

    if (this.client) {
      this.client.on('connect', log('CLIENT'));
      this.client.on('reconnecting', () => this.logger.warn('Redis CLIENT reconnecting'));
    }

    if (this.pubClient) {
      this.pubClient.on('connect', log('PUB'));
      this.pubClient.on('reconnecting', () => this.logger.warn('Redis PUB reconnecting'));
    }

    if (this.subClient) {
      this.subClient.on('connect', log('SUB'));
      this.subClient.on('reconnecting', () => this.logger.warn('Redis SUB reconnecting'));
    }
  }

  // ---------------------------------------------------------
  // Basic SET / GET
  // ---------------------------------------------------------
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
  if (!this.client) {
    this.logger.warn('Redis client not available - set ignored');
    return;
  }

  const serialized = JSON.stringify(value);

  try {
    if (ttlSeconds && Number.isFinite(ttlSeconds)) {
      await this.client.call(
        'SET',
        key,
        serialized,
        'EX',
        String(ttlSeconds)
      );
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
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as any;
      }
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
      this.logger.error(`Redis del error for key=${key}: ${err?.message ?? String(err)}`);
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
      this.logger.error(`Redis exists error for key=${key}: ${err?.message ?? String(err)}`);
      return false;
    }
  }

  // ---------------------------------------------------------
  // Hash
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Pub/Sub
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Rate Limit
  // ---------------------------------------------------------
  async rateLimit(
    key: string,
    windowSec: number,
    max: number,
  ): Promise<boolean> {
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

  // ---------------------------------------------------------
  // Distributed Lock (with sendCommand)
  // ---------------------------------------------------------
  async acquireLock(key: string, ttlSec = 5): Promise<boolean> {
  if (!this.client) return false;

  try {
    const result = await this.client.call(
      'SET',
      key,
      '1',
      'NX',
      'EX',
      String(ttlSec)
    );

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

  // ---------------------------------------------------------
  // Cache
  // ---------------------------------------------------------
  async cache<T>(
    key: string,
    ttlSeconds: number,
    resolver: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await resolver();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  // ---------------------------------------------------------
  // Health check
  // ---------------------------------------------------------
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
}
