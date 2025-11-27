// ==========================================
// file: backend/src/health/system-check.service.ts
// ==========================================

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { R2Service } from '../r2/r2.service';

@Injectable()
export class SystemCheckService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly r2: R2Service,
  ) {}

  private readonly awsRegion =
    process.env.AWS_REGION?.trim() || 'ap-southeast-7';

  private secretsClient = new SecretsManagerClient({
    region: this.awsRegion,
  });

  async checkBackend() {
    return true;
  }

  async checkPostgres() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async checkRedis() {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  async checkQueue() {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  // ==========================================
  // FIX #1 — Check AWS Secrets correctly
  // ==========================================
  async checkSecrets() {
    try {
      const secretName = process.env.AWS_SECRET_NAME;

      if (!secretName) return false;

      // ต้อง test read จริงจาก AWS
      await this.secretsClient.send(
        new GetSecretValueCommand({
          SecretId: secretName,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // FIX #2 — Check R2 using actual environment used by R2Module
  // ==========================================
  async checkR2() {
    try {
      const bucket = process.env.R2_BUCKET_NAME;
      const endpoint = process.env.R2_ENDPOINT;
      const accessKey = process.env.R2_ACCESS_KEY_ID;
      const secretKey = process.env.R2_SECRET_ACCESS_KEY;

      if (!bucket || !endpoint || !accessKey || !secretKey) return false;

      // Test R2 service directly
      const ok = await this.r2.healthCheck();
      return ok === true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // FIX #3 — Check socket by validating backend URL
  // ==========================================
  async checkSocket() {
    try {
      const base =
        process.env.BACKEND_PUBLIC_URL ||
        process.env.API_PUBLIC_URL ||
        process.env.PRODUCTION_BACKEND_URL ||
        null;

      if (!base) return false;

      // ยังไม่ต้อง connect socket จริง เพียง validate URL format
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

  // ==========================================
  // RETURN ALL STATUS
  // ==========================================
  async getStatus() {
    return {
      backend: await this.checkBackend(),
      postgres: await this.checkPostgres(),
      redis: await this.checkRedis(),
      secrets: await this.checkSecrets(),
      r2: await this.checkR2(),
      queue: await this.checkQueue(),
      socket: await this.checkSocket(),
    };
  }
}
