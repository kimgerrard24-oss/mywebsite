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

  // ------------------------------------------
  // Database health check (with timeout)
  // ------------------------------------------
  async dbCheck() {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB timeout')), 2000),
      );

      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        timeout,
      ]);

      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  // ------------------------------------------
  // Redis health check (with timeout)
  // ------------------------------------------
  async redisCheck() {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis timeout')), 1500),
      );

      const pong = await Promise.race([this.redis.ping(), timeout]);

      return { ok: pong === 'PONG' };
    } catch {
      return { ok: false };
    }
  }

  // ------------------------------------------
  // Secrets Manager config check (safe)
  // ------------------------------------------
  async secretsCheck() {
    try {
      const valid =
        Boolean(process.env.AWS_SECRET_NAME) &&
        Boolean(process.env.AWS_REGION);

      return { ok: valid };
    } catch {
      return { ok: false };
    }
  }

  // ------------------------------------------
  // R2 config check (do NOT leak secrets)
  // ------------------------------------------
  async r2Check() {
    try {
      const valid =
        Boolean(process.env.R2_BUCKET_NAME) &&
        Boolean(process.env.R2_ENDPOINT) &&
        Boolean(process.env.R2_ACCESS_KEY_ID) &&
        Boolean(process.env.R2_SECRET_ACCESS_KEY);

      return { ok: valid };
    } catch {
      return { ok: false };
    }
  }

  // ------------------------------------------
  // Queue check = reuse Redis check
  // ------------------------------------------
  async queueCheck() {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue timeout')), 1500),
      );

      const pong = await Promise.race([this.redis.ping(), timeout]);

      return { ok: pong === 'PONG' };
    } catch {
      return { ok: false };
    }
  }

  // ------------------------------------------
  // Socket check → just validate config
  // ------------------------------------------
  async socketCheck() {
    try {
      const base =
        process.env.BACKEND_PUBLIC_URL ||
        process.env.API_PUBLIC_URL ||
        process.env.PRODUCTION_BACKEND_URL;

      return { ok: Boolean(base) };
    } catch {
      return { ok: false };
    }
  }

  // ------------------------------------------
  // Basic system info
  // ------------------------------------------
  async systemInfo() {
    return {
      ok: true,
      uptime: process.uptime(),
      node: process.version,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }

  // ------------------------------------------
  // Faster parallel system-wide health check (with global timeout)
  // ------------------------------------------
  async systemCheck() {
    const checks = Promise.all([
      this.dbCheck(),
      this.redisCheck(),
      this.secretsCheck(),
      this.r2Check(),
      this.queueCheck(),
      this.socketCheck(),
    ]);

    // Global timeout 2.5 sec for entire system-check
    const globalTimeout = new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            backend: true,
            postgres: false,
            redis: false,
            secrets: false,
            r2: false,
            queue: false,
            socket: false,
          }),
        2500,
      ),
    );

    const result: any = await Promise.race([checks, globalTimeout]);

    if (Array.isArray(result)) {
      const [db, redis, secrets, r2, queue, socket] = result;

      return {
        backend: true,
        postgres: db.ok,
        redis: redis.ok,
        secrets: secrets.ok,
        r2: r2.ok,
        queue: queue.ok,
        socket: socket.ok,
      };
    }

    return result;
  }
}
