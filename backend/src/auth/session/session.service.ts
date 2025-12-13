// src/auth/session/session.service.ts

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import * as argon2 from 'argon2';
import {
  ACCESS_TOKEN_KEY_PREFIX,
  REFRESH_TOKEN_KEY_PREFIX,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from './session.constants';
import { SessionPayload, StoredSessionData } from './session.types';

@Injectable()
export class SessionService implements OnModuleDestroy {
  private readonly logger = new Logger(SessionService.name);
  private readonly redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined;
    const redisPassword = process.env.REDIS_PASSWORD;
    const useTLS = process.env.REDIS_USE_TLS === 'true';

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        tls: useTLS ? {} : undefined,
        enableReadyCheck: true,
        lazyConnect: false,
      });
    } else {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword || undefined,
        tls: useTLS ? {} : undefined,
        enableReadyCheck: true,
        lazyConnect: false,
      });
    }

    this.redis.on('error', (err) => {
      this.logger.error('Redis error in SessionService', err.stack || String(err));
    });
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
    } catch (e) {
      this.logger.error('Error closing Redis connection in SessionService', e);
    }
  }

  private buildAccessKey(jti: string): string {
    return `${ACCESS_TOKEN_KEY_PREFIX}${jti}`;
  }

  private buildRefreshKey(refreshToken: string): string {
    return `${REFRESH_TOKEN_KEY_PREFIX}${refreshToken}`;
  }

  private buildUserSessionKey(userId: string): string {
    return `session:user:${userId}`;
  }

  /**
   * สร้าง session ใหม่ (รองรับหลายอุปกรณ์)
   */
  async createSession(
    payload: SessionPayload,
    jti: string,
    refreshToken: string,
    meta?: {
  deviceId?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  }

  ): Promise<void> {
    const refreshTokenHash = await argon2.hash(refreshToken);

    const sessionData: StoredSessionData & { userId: string } = {
      userId: payload.userId,
      deviceId: meta?.deviceId ?? 'unknown',
      payload,
      refreshTokenHash,
      userAgent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(), // ← เพิ่มพร้อมกัน

    };

    const accessKey = this.buildAccessKey(jti);
    const refreshKey = this.buildRefreshKey(refreshToken);
    const userSessionKey = this.buildUserSessionKey(payload.userId);
    const serialized = JSON.stringify(sessionData);

    const pipeline = this.redis.pipeline();

    pipeline.set(accessKey, serialized, 'EX', ACCESS_TOKEN_TTL_SECONDS);
    pipeline.set(refreshKey, serialized, 'EX', REFRESH_TOKEN_TTL_SECONDS);

    // 🔹 bind jti → user (multi-device support)
    pipeline.sadd(userSessionKey, jti);
    pipeline.expire(userSessionKey, REFRESH_TOKEN_TTL_SECONDS);

    try {
      await pipeline.exec();
    } catch (e) {
      this.logger.error('Error setting session in Redis', e);
    }
  }

  /**
   * ดึง session ทั้งหมดของ user (ทุกอุปกรณ์)
   */
  async getSessionsByUser(userId: string): Promise<
    Array<{ jti: string; data: StoredSessionData | null }>
  > {
    const userSessionKey = this.buildUserSessionKey(userId);
    const jtis = await this.redis.smembers(userSessionKey);

    const results: Array<{ jti: string; data: StoredSessionData | null }> = [];

    for (const jti of jtis) {
      const raw = await this.redis.get(this.buildAccessKey(jti));
      if (!raw) {
        // cleanup jti ที่หมดอายุแล้ว
        await this.redis.srem(userSessionKey, jti);
        continue;
      }

      try {
        results.push({ jti, data: JSON.parse(raw) });
      } catch {
        results.push({ jti, data: null });
      }
    }

    return results;
  }

  async getSessionByRefreshToken(
    refreshToken: string,
  ): Promise<StoredSessionData | null> {
    const refreshKey = this.buildRefreshKey(refreshToken);
    const raw = await this.redis.get(refreshKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredSessionData;
    } catch (e) {
      this.logger.error('Failed to parse StoredSessionData from Redis', e);
      return null;
    }
  }

  async verifyRefreshToken(
    refreshToken: string,
    stored: StoredSessionData,
  ): Promise<boolean> {
    try {
      return await argon2.verify(stored.refreshTokenHash, refreshToken);
    } catch (e) {
      this.logger.error('Error verifying refresh token hash', e);
      return false;
    }
  }

  /**
   * revoke session เฉพาะ device (jti)
   */
  async revokeByJTI(jti: string): Promise<void> {
    const accessKey = this.buildAccessKey(jti);

    try {
      const raw = await this.redis.get(accessKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSessionData & { userId?: string };
        if (parsed?.userId) {
          await this.redis.srem(this.buildUserSessionKey(parsed.userId), jti);
        }
      }

      await this.redis.del(accessKey);
    } catch (e) {
      this.logger.error('Error revoking access token key', e);
    }
  }

  /**
   * revoke ทุก session ของ user (ใช้ตอน security incident / change password)
   */
  async revokeAllByUser(userId: string): Promise<void> {
    const userSessionKey = this.buildUserSessionKey(userId);
    const jtis = await this.redis.smembers(userSessionKey);

    if (jtis.length === 0) return;

    const pipeline = this.redis.pipeline();

    for (const jti of jtis) {
      pipeline.del(this.buildAccessKey(jti));
    }

    pipeline.del(userSessionKey);

    try {
      await pipeline.exec();
    } catch (e) {
      this.logger.error('Error revoking all sessions for user', e);
    }
  }

  async revokeByRefreshToken(refreshToken: string): Promise<void> {
    const refreshKey = this.buildRefreshKey(refreshToken);
    try {
      await this.redis.del(refreshKey);
    } catch (e) {
      this.logger.error('Error revoking refresh token key', e);
    }
  }
  
}
