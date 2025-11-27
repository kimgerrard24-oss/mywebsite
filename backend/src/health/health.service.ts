// ==========================================
// file: backend/src/health/health.service.ts
// ==========================================

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // ------------------------------------------------------------
  // BASIC API CHECK
  // ------------------------------------------------------------
  async apiCheck() {
    return { ok: true, timestamp: new Date().toISOString() };
  }

  // ------------------------------------------------------------
  // DATABASE CHECK
  // ------------------------------------------------------------
  async dbCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  }

  // ------------------------------------------------------------
  // REDIS CHECK
  // ------------------------------------------------------------
  async redisCheck() {
    try {
      const pong = await this.redis.ping();
      return { ok: pong === 'PONG' };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  }

  // ------------------------------------------------------------
  // REQUIRED SECRETS CHECK
  // ------------------------------------------------------------
  async secretsCheck() {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'SECRET_KEY',
      'SESSION_COOKIE_NAME',
      'SESSION_COOKIE_MAX_AGE_MS',
      'COOKIE_DOMAIN',

      // OAuth
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URL',
      'GOOGLE_CALLBACK_URL',
      'GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN',

      'FACEBOOK_CLIENT_ID',
      'FACEBOOK_CLIENT_SECRET',
      'FACEBOOK_REDIRECT_URL',
      'FACEBOOK_CALLBACK_URL',
      'FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN',

      // Firebase
      'FIREBASE_SERVICE_ACCOUNT_BASE64',

      // Redis
      'REDIS_URL',

      // R2
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_ENDPOINT',

      // Misc
      'ALLOWED_ORIGINS',
    ];

    const missing = required.filter((k) => !process.env[k]);

    return {
      ok: missing.length === 0,
      missing,
    };
  }

  // ------------------------------------------------------------
  // R2 CHECK — REPLACEMENT FOR S3
  //
  // ทำงานโดยการส่ง HEAD request ไปยัง R2 bucket URL
  // เช่น: https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<bucket>
  // ------------------------------------------------------------
  async r2Check() {
    try {
      const endpoint = process.env.R2_ENDPOINT || '';
      const bucket = process.env.R2_BUCKET_NAME || '';

      if (!endpoint || !bucket) {
        return { ok: false, error: 'R2 env vars missing' };
      }

      const url = `${endpoint.replace(/\/+$/, '')}/${bucket}`;

      const res = await fetch(url, { method: 'HEAD' });

      return { ok: res.status === 200 || res.status === 204 };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  }

  // ------------------------------------------------------------
  // QUEUE CHECK (Redis)
  // ------------------------------------------------------------
  async queueCheck() {
    try {
      const pong = await this.redis.ping();
      return { ok: pong === 'PONG' };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  }

  // ------------------------------------------------------------
  // SOCKET.IO CHECK
  // ------------------------------------------------------------
  async socketCheck() {
    try {
      const t = Date.now();
      const base =
        process.env.BACKEND_PUBLIC_URL ||
        'https://api.phlyphant.com';

      const url = `${base}/socket.io/?EIO=4&transport=polling&t=${t}`;

      const r = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Origin: 'https://phlyphant.com',
        },
      });

      return { ok: r.status === 200 || r.status === 204 };
    } catch {
      return { ok: false };
    }
  }

  // ------------------------------------------------------------
  // SYSTEM INFO (SAFE)
  // ------------------------------------------------------------
  async systemInfo() {
    return {
      ok: true,
      uptime: process.uptime(),
      node: process.version,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }

  // ------------------------------------------------------------
  // COMBINED SYSTEM CHECK
  // ------------------------------------------------------------
  async systemCheck() {
    return {
      backend: true,
      postgres: (await this.dbCheck()).ok,
      redis: (await this.redisCheck()).ok,
      secrets: (await this.secretsCheck()).ok,
      r2: (await this.r2Check()).ok,        // <-- replaced S3
      queue: (await this.queueCheck()).ok,
      socket: (await this.socketCheck()).ok,
    };
  }
}
