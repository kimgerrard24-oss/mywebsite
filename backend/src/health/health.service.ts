// ==========================================
// file: backend/src/health/health.service.ts
// ==========================================

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

// เพิ่ม AWS Secrets Manager (ใช้ method เดียวกับ SecretsModule)
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

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
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB timeout')), 2000),
      );

      await Promise.race([this.prisma.$queryRaw`SELECT 1`, timeout]);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

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

  // ==========================================
  // FIXED: REAL AWS SECRETS MANAGER CHECK
  // ==========================================
  async secretsCheck() {
    try {
      // ดึงชื่อ secret ที่ backend ใช้จริง
      const secretName =
        process.env.OAUTH_CLIENT_ID_SECRET_SOCIAL_LOGIN_URL_REDIRECT ||
        process.env.AWS_OAUTH_SECRET_NAME ||
        null;

      if (!secretName) return { ok: false };

      const client = new SecretsManagerClient({
        region: process.env.AWS_REGION,
      });

      await client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
        }),
      );

      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

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
    const checks = Promise.all([
      this.dbCheck(),
      this.redisCheck(),
      this.secretsCheck(),
      this.r2Check(),
      this.queueCheck(),
      this.socketCheck(),
    ]);

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
