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

    const sessionData: StoredSessionData = {
      payload,
      refreshTokenHash,
      userAgent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
      createdAt: new Date().toISOString(),
    };

    const accessKey = this.buildAccessKey(accessToken);
    const refreshKey = this.buildRefreshKey(refreshToken);
    const serialized = JSON.stringify(sessionData);

    // ใช้ pipeline เพื่อลด round-trip
    const pipeline = this.redis.pipeline();

    pipeline.set(accessKey, serialized, 'EX', ACCESS_TOKEN_TTL_SECONDS);
    pipeline.set(refreshKey, serialized, 'EX', REFRESH_TOKEN_TTL_SECONDS);

    await pipeline.exec();
  }

  /**
   * ดึง session จาก refresh token
   */
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

  /**
   * ตรวจว่า refresh token ถูกต้อง (argon2.verify)
   */
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
   * ลบ session เดิมออกจาก Redis ตาม refresh token เก่า
   * หมายเหตุ: เรารู้แค่ refresh token เก่า → ลบได้แค่ refreshKey โดยตรง
   * ส่วน accessKey เก่า แนะนำเก็บ accessToken ใน sessionData แล้วลบเพิ่มในอนาคต
   */
  async revokeByRefreshToken(refreshToken: string): Promise<void> {
    const refreshKey = this.buildRefreshKey(refreshToken);
    try {
      await this.redis.del(refreshKey);
    } catch (e) {
      this.logger.error('Error revoking refresh token key', e);
    }
  }

  /**
   * ลบ accessKey ตาม access token (ใช้ในอนาคตถ้าคุณเก็บค่าไว้)
   */
  async revokeByAccessToken(accessToken: string): Promise<void> {
    const accessKey = this.buildAccessKey(accessToken);
    try {
      await this.redis.del(accessKey);
    } catch (e) {
      this.logger.error('Error revoking access token key', e);
    }
  }
}
