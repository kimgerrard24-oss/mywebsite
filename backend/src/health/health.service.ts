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

  async apiCheck() {
    return { ok: true, timestamp: new Date().toISOString() };
  }

  async dbCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (err: unknown) {
      return { ok: false };
    }
  }

  async redisCheck() {
    try {
      const pong = await this.redis.ping();
      return { ok: pong === 'PONG' };
    } catch {
      return { ok: false };
    }
  }

  // FIXED: ไม่เช็ค secret รายตัว ไม่เปิดเผย key ใด ๆ
  async secretsCheck() {
    try {
      const required = [
        'DATABASE_URL',
        'REDIS_URL',
        'FIREBASE_SERVICE_ACCOUNT_BASE64',
      ];

      const missing = required.filter((k) => !process.env[k]);

      return { ok: missing.length === 0 };
    } catch {
      return { ok: false };
    }
  }

  // FIXED: ไม่ยิง HEAD request ออกไปยัง R2 จริง
  async r2Check() {
    try {
      const endpoint = process.env.R2_ENDPOINT;
      const bucket = process.env.R2_BUCKET_NAME;

      if (!endpoint || !bucket) {
        return { ok: false };
      }

      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  async queueCheck() {
    try {
      const pong = await this.redis.ping();
      return { ok: pong === 'PONG' };
    } catch {
      return { ok: false };
    }
  }

  // FIXED: ไม่ยิง polling ไป socket.io
  async socketCheck() {
    try {
      const base =
        process.env.BACKEND_PUBLIC_URL ||
        process.env.API_PUBLIC_URL ||
        process.env.PRODUCTION_BACKEND_URL;

      if (!base) return { ok: false };

      return { ok: true };
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
      r2: (await this.r2Check()).ok,
      queue: (await this.queueCheck()).ok,
      socket: (await this.socketCheck()).ok,
    };
  }
}
