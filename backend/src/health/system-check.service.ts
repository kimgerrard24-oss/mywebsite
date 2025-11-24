// ==========================================
// file: backend/src/system-check/system-check.service.ts
// ==========================================

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SystemCheckService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // ==========================================
  // AWS CONFIG (ใช้สำหรับ Secrets Manager เท่านั้น)
  // ==========================================
  private readonly awsRegion =
    process.env.AWS_REGION?.trim() || 'ap-southeast-7';

  private secrets = new SecretsManagerClient({
    region: this.awsRegion,
  });

  // ==========================================
  // BASIC HEALTH CHECK
  // ==========================================
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
  // AWS SECRETS MANAGER CHECK (ยังคงต้องใช้ AWS)
  // ==========================================
  async checkSecrets() {
    try {
      const secretName = process.env.AWS_SECRET_NAME;
      if (!secretName || secretName.trim().length === 0) return false;

      const cmd = new GetSecretValueCommand({ SecretId: secretName });
      await this.secrets.send(cmd);

      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // R2 BUCKET CHECK (แทน S3)
  //
  // วิธี: HEAD https://ACCOUNT_ID.r2.cloudflarestorage.com/BUCKET
  //
  // ถ้าได้ status 200 หรือ 204 แสดงว่า bucket ใช้ได้
  // ==========================================
  async checkS3() {
    try {
      const bucket =
        process.env.R2_BUCKET_NAME || null;

      const endpoint =
        process.env.R2_ENDPOINT || null;

      if (!bucket || !endpoint) return false;

      const url = `${endpoint.replace(/\/+$/, '')}/${bucket}`;

      const res = await fetch(url, {
        method: 'HEAD',
      });

      return res.status === 200 || res.status === 204;
    } catch {
      return false;
    }
  }

  // ==========================================
  // SOCKET.IO CHECK (Production)
  // ==========================================
  async checkSocket() {
    try {
      const t = Date.now();

      const base =
        process.env.BACKEND_PUBLIC_URL ||
        process.env.API_PUBLIC_URL ||
        process.env.PRODUCTION_BACKEND_URL ||
        'https://api.phlyphant.com';

      const origin =
        process.env.FRONTEND_PUBLIC_URL ||
        'https://phlyphant.com';

      const url = `${base}/socket.io/?EIO=4&transport=polling&t=${t}`;

      const r = await fetch(url, {
        method: 'GET',
        headers: {
          Origin: origin,
          'User-Agent': 'SystemCheckBot',
        },
      });

      if (r.status === 200 || r.status === 204) return true;

      return false;
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
      s3: await this.checkS3(),   // now R2
      queue: await this.checkQueue(),
      socket: await this.checkSocket(),
    };
  }
}
