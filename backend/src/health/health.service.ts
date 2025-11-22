// ==========================================
// file: backend/src/health/health.service.ts
// ==========================================
import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async apiCheck() {
    return { ok: true, timestamp: new Date().toISOString() };
  }

  async dbCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  }

  async redisCheck() {
    try {
      const pong = await this.redis.ping();
      return { ok: pong === 'PONG' };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  }

  // ============================================================================
  // UPDATED: Required Authentication + OAuth + Firebase + JWT_ENV checks
  // ============================================================================
  async secretsCheck() {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'SECRET_KEY',
      'SESSION_COOKIE_NAME',
      'SESSION_COOKIE_MAX_AGE_MS',
      'COOKIE_DOMAIN',

      // Google OAuth
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URL',
      'GOOGLE_CALLBACK_URL',
      'GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN',

      // Facebook OAuth
      'FACEBOOK_CLIENT_ID',
      'FACEBOOK_CLIENT_SECRET',
      'FACEBOOK_REDIRECT_URL',
      'FACEBOOK_CALLBACK_URL',
      'FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN',

      // Firebase Auth
      'FIREBASE_SERVICE_ACCOUNT_BASE64',

      // Redis
      'REDIS_URL',

      // AWS S3
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',

      // Optional but recommended
      'ALLOWED_ORIGINS',
    ];

    const missing = required.filter((k) => !process.env[k]);

    return {
      ok: missing.length === 0,
      missing,
    };
  }

  async s3Check() {
    try {
      const region = process.env.AWS_REGION || 'ap-southeast-7';
      const bucket = process.env.AWS_S3_BUCKET;

      if (!bucket) return { ok: false, error: 'AWS_S3_BUCKET is not set' };

      const client = new S3Client({ region });

      await client.send(
        new HeadBucketCommand({
          Bucket: bucket,
        }),
      );

      return { ok: true };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  }

  async queueCheck() {
    try {
      const pong = await this.redis.ping();
      return { ok: pong === 'PONG' };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
    }
  }

  // =====================================================
  // UPDATED: Use production URL and Origin from ENV
  // =====================================================
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

      const pollingOk = r.status === 200 || r.status === 204;

      return { ok: pollingOk };
    } catch {
      return { ok: false };
    }
  }

  async systemInfo() {
    return {
      ok: true,
      uptime: process.uptime(),
      node: process.version,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }

  async systemCheck() {
    return {
      backend: true,
      postgres: (await this.dbCheck()).ok,
      redis: (await this.redisCheck()).ok,
      secrets: (await this.secretsCheck()).ok,
      s3: (await this.s3Check()).ok,
      queue: (await this.queueCheck()).ok,
      socket: (await this.socketCheck()).ok,
    };
  }
}
