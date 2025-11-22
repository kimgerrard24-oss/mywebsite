// ==========================================
// file: src/redis/redis.service.ts
// ==========================================

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis as RedisClient } from 'ioredis';

// ---------------------------------------------------------
// Safe ENV loader
// ---------------------------------------------------------
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
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
  // Environment validation for production safety
  // ---------------------------------------------------------
  private validateEnv() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      this.logger.error(
        'REDIS_URL is missing. Check backend/.env.production'
      );
    } else {
      if (process.env.NODE_ENV === 'production') {
        this.logger.log(`Redis URL loaded: ${redisUrl}`);
      }
    }

    // Additional safety for production
    requireEnv('REDIS_URL');
  }

  // ---------------------------------------------------------
  // Global Error Handling (prevent app crash)
  // ---------------------------------------------------------
  private setupErrorHandling() {
    this.client.on('error', (err) =>
      this.logger.error(`Redis CLIENT error: ${err.message}`),
    );

    this.pubClient.on('error', (err) =>
      this.logger.error(`Redis PUB error: ${err.message}`),
    );

    this.subClient.on('error', (err) =>
      this.logger.error(`Redis SUB error: ${err.message}`),
    );
  }

  // ---------------------------------------------------------
  // Connection event handlers (production stability)
  // ---------------------------------------------------------
  private setupConnectionHandlers() {
    const log = (type: string) => (msg?: any) =>
      this.logger.log(`Redis ${type}: ${msg || 'connected'}`);

    this.client.on('connect', log('CLIENT'));
    this.pubClient.on('connect', log('PUB'));
    this.subClient.on('connect', log('SUB'));

    this.client.on('reconnecting', () =>
      this.logger.warn('Redis CLIENT reconnecting'),
    );
    this.pubClient.on('reconnecting', () =>
      this.logger.warn('Redis PUB reconnecting'),
    );
    this.subClient.on('reconnecting', () =>
      this.logger.warn('Redis SUB reconnecting'),
    );
  }

  // ---------------------------------------------------------
  // Basic SET / GET with JSON serialization
  // ---------------------------------------------------------
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.call(
        'SET',
        key,
        serialized,
        'EX',
        ttlSeconds.toString(),
      );
    } else {
      await this.client.set(key, serialized);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  // ---------------------------------------------------------
  // Hash operations
  // ---------------------------------------------------------
  async hset(hash: string, key: string, value: string): Promise<void> {
    await this.client.hset(hash, key, value);
  }

  async hget(hash: string, key: string): Promise<string | null> {
    return await this.client.hget(hash, key);
  }

  async hgetall(hash: string): Promise<Record<string, string>> {
    return await this.client.hgetall(hash);
  }

  async hincr(hash: string, key: string, amount = 1): Promise<number> {
    return await this.client.hincrby(hash, key, amount);
  }

  // ---------------------------------------------------------
  // Pub/Sub Messaging — realtime feed, notifications
  // ---------------------------------------------------------
  async publish(channel: string, message: any): Promise<void> {
    const serialized = JSON.stringify(message);
    await this.pubClient.publish(channel, serialized);
  }

  subscribe(channel: string, handler: (message: any) => void): void {
    this.subClient.subscribe(channel, (err) => {
      if (err) {
        this.logger.error(`Failed to subscribe to channel: ${channel}`);
      }
    });

    this.subClient.on('message', (chan, msg) => {
      if (chan !== channel) return;

      try {
        handler(JSON.parse(msg));
      } catch {
        handler(msg);
      }
    });
  }

  // ---------------------------------------------------------
  // Rate Limit — login, posting, comments
  // ---------------------------------------------------------
  async rateLimit(
    key: string,
    windowSec: number,
    max: number,
  ): Promise<boolean> {
    const count = await this.client.incr(key);

    if (count === 1) {
      await this.client.expire(key, windowSec);
    }

    return count > max;
  }

  // ---------------------------------------------------------
  // Distributed Lock (duplicate prevention)
  // ---------------------------------------------------------
  async acquireLock(key: string, ttlSec = 5): Promise<boolean> {
    const result = await this.client.call(
      'SET',
      key,
      '1',
      'NX',
      'EX',
      ttlSec.toString(),
    );
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.client.del(key);
  }

  // ---------------------------------------------------------
  // Cache wrapper — feed, explore, profile caching
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
  // Health check (used by HealthModule & Load Balancer)
  // ---------------------------------------------------------
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
}
