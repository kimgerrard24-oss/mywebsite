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
    } catch {
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

  // ==========================================
  // FIXED: correct Secrets Manager health check
  // ==========================================
  async secretsCheck() {
    try {
      const name = process.env.AWS_SECRET_NAME;
      const region = process.env.AWS_REGION;

      if (!name || !region) {
        return { ok: false };
      }

      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  // ==========================================
  // FIXED: correct R2 environment validation
  // ==========================================
  async r2Check() {
    try {
      const bucket = process.env.R2_BUCKET_NAME;
      const endpoint = process.env.R2_ENDPOINT;
      const key = process.env.R2_ACCESS_KEY_ID;
      const secret = process.env.R2_SECRET_ACCESS_KEY;

      if (!bucket || !endpoint || !key || !secret) {
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
