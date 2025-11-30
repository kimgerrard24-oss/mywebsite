// ==========================================
// file: backend/src/health/system-check.service.ts
// ==========================================

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { R2Service } from '../r2/r2.service';

// เพิ่ม: ใช้ AWS Secrets Manager แบบเดียวกับ SecretsModule
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SystemCheckService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly r2: R2Service,
  ) {}

  // ------------------------------------------
  // Backend is always ok if service is alive
  // ------------------------------------------
  async checkBackend() {
    return true;
  }

  // ------------------------------------------
  // Postgres check (with timeout)
  // ------------------------------------------
  async checkPostgres() {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB timeout')), 2000),
      );

      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        timeout,
      ]);

      return true;
    } catch {
      return false;
    }
  }

  // ------------------------------------------
  // Redis check (with timeout)
  // ------------------------------------------
  async checkRedis() {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis timeout')), 1500),
      );

      const pong = await Promise.race([this.redis.ping(), timeout]);

      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  // Queue = Redis (same instance)
  async checkQueue() {
    return this.checkRedis();
  }

  // ------------------------------------------
  // FIXED: Real AWS Secrets Manager check
  // ------------------------------------------
  async checkSecrets() {
    try {
      const secretName =
        process.env.OAUTH_CLIENT_ID_SECRET_SOCIAL_LOGIN_URL_REDIRECT ||
        process.env.AWS_OAUTH_SECRET_NAME ||
        null;

      if (!secretName) return false;

      const client = new SecretsManagerClient({
        region: process.env.AWS_REGION,
      });

      await client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }

  // ------------------------------------------
  // FIXED: R2 config validation + r2.healthCheck()
  // ------------------------------------------
  async checkR2() {
    try {
      const ok =
        Boolean(process.env.R2_BUCKET_NAME) &&
        Boolean(process.env.R2_ENDPOINT) &&
        Boolean(process.env.R2_ACCESS_KEY_ID) &&
        Boolean(process.env.R2_SECRET_ACCESS_KEY);

      if (!ok) return false;

      const r2Ok = await this.r2.healthCheck();
      return r2Ok === true;
    } catch {
      return false;
    }
  }

  // ------------------------------------------
  // Socket check — validate URL only
  // ------------------------------------------
  async checkSocket() {
    try {
      const base =
        process.env.BACKEND_PUBLIC_URL ||
        process.env.API_PUBLIC_URL ||
        process.env.PRODUCTION_BACKEND_URL ||
        null;

      if (!base) return false;

      try {
        new URL(base);
      } catch {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // ------------------------------------------
  // FAST PARALLEL HEALTH CHECK
  // ------------------------------------------
  async getStatus() {
    const [
      backend,
      postgres,
      redis,
      secrets,
      r2,
      queue,
      socket,
    ] = await Promise.all([
      this.checkBackend(),
      this.checkPostgres(),
      this.checkRedis(),
      this.checkSecrets(),
      this.checkR2(),
      this.checkQueue(),
      this.checkSocket(),
    ]);

    return {
      backend,
      postgres,
      redis,
      secrets,
      r2,
      queue,
      socket,
    };
  }
}
