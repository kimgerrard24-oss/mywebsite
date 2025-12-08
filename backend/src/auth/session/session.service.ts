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

  private buildAccessKey(accessToken: string): string {
    return `${ACCESS_TOKEN_KEY_PREFIX}${accessToken}`;
  }

  private buildRefreshKey(refreshToken: string): string {
    return `${REFRESH_TOKEN_KEY_PREFIX}${refreshToken}`;
  }

  /**
   * สร้าง session ใหม่: เก็บใน Redis ทั้ง access และ refresh key
   */
  async createSession(
    payload: SessionPayload,
    accessToken: string,
    refreshToken: string,
    meta?: { userAgent?: string | null; ip?: string | null },
  ): Promise<void> {
    const refreshTokenHash = await argon2.hash(refreshToken);
    const accessTokenHash = await argon2.hash(accessToken);

    const sessionData: StoredSessionData = {
      payload,
      refreshTokenHash,
      accessTokenHash,
      userAgent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
      createdAt: new Date().toISOString(),
    };

    const accessKey = this.buildAccessKey(accessToken);
    const refreshKey = this.buildRefreshKey(refreshToken);
    const serialized = JSON.stringify(sessionData);

    const pipeline = this.redis.pipeline();

    pipeline.set(accessKey, serialized, 'EX', ACCESS_TOKEN_TTL_SECONDS);
    pipeline.set(refreshKey, serialized, 'EX', REFRESH_TOKEN_TTL_SECONDS);

    await pipeline.exec();
  }

  async getSessionByRefreshToken(
    refreshToken: string,
  ): Promise<StoredSessionData | null> {
    const refreshKey = this.buildRefreshKey(refreshToken);
    const raw = await this.redis.get(refreshKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as StoredSessionData;
      return parsed;
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

  async revokeByRefreshToken(refreshToken: string): Promise<void> {
    const refreshKey = this.buildRefreshKey(refreshToken);
    try {
      await this.redis.del(refreshKey);
    } catch (e) {
      this.logger.error('Error revoking refresh token key', e);
    }
  }

  async revokeByAccessToken(accessToken: string): Promise<void> {
    const accessKey = this.buildAccessKey(accessToken);
    try {
      await this.redis.del(accessKey);
    } catch (e) {
      this.logger.error('Error revoking access token key', e);
    }
  }
}
