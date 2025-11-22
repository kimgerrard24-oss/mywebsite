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
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class SystemCheckService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // ==========================================
  // AWS CONFIG (ใช้ค่า env จาก production)
  // ==========================================
  private readonly awsRegion =
    process.env.AWS_REGION?.trim() || 'ap-southeast-7';

  private secrets = new SecretsManagerClient({
    region: this.awsRegion,
  });

  private s3 = new S3Client({
    region: this.awsRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
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
  // AWS SECRETS MANAGER CHECK
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
  // AWS S3 / Cloudflare R2 CHECK
  // ==========================================
  async checkS3() {
    try {
      const bucket =
        process.env.AWS_S3_BUCKET ||
        process.env.R2_BUCKET_NAME || // ใช้ R2 bucket แทน
        null;

      if (!bucket) return false;

      const cmd = new HeadBucketCommand({ Bucket: bucket });
      await this.s3.send(cmd);

      return true;
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
      s3: await this.checkS3(),
      queue: await this.checkQueue(),
      socket: await this.checkSocket(),
    };
  }
}
