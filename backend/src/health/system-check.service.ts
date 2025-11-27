// ==========================================
// file: backend/src/health/system-check.service.ts
// ==========================================

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
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

  private secrets = new SecretsManagerClient({
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
  // FIXED: Secrets Manager Health Check
  // ไม่ดึง Secret จริง
  // เช็คแค่การตั้งค่า env เท่านั้น
  // ==========================================
  async checkSecrets() {
    try {
      const secretName = process.env.AWS_SECRET_NAME;
      const region = process.env.AWS_REGION;

      if (!secretName || !region) return false;

      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // FIXED: R2 Bucket Health Check (ไม่ยิง request)
  // ปลอดภัยที่สุดสำหรับ Public Health Check
  // ==========================================
  async checkR2() {
    try {
      const bucket = process.env.CF_R2_BUCKET;
      const endpoint = process.env.CF_R2_PUBLIC_ENDPOINT;

      if (!bucket || !endpoint) return false;

      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // FIXED: Socket Health Check (ไม่ยิง polling)
  // ตรวจเฉพาะว่ามีการตั้งค่า URL ของ websocket หรือไม่
  // ==========================================
  async checkSocket() {
    try {
      const base =
        process.env.BACKEND_PUBLIC_URL ||
        process.env.API_PUBLIC_URL ||
        process.env.PRODUCTION_BACKEND_URL ||
        null;

      if (!base) return false;

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
