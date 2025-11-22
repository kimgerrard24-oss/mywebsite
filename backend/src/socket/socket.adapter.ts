// ==========================================
// file: backend/src/socket/socketadapter.ts
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
export class SocketAdapterCheckService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private secrets = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'ap-southeast-7',
  });

  private s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-7',
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

  async checkSecrets() {
    try {
      const secretName =
        process.env.AWS_OAUTH_SECRET_NAME ||
        process.env.AWS_SECRET_NAME;

      if (!secretName) return false;

      const cmd = new GetSecretValueCommand({
        SecretId: secretName,
      });

      await this.secrets.send(cmd);
      return true;
    } catch {
      return false;
    }
  }

  async checkS3() {
    try {
      const bucket =
        process.env.AWS_S3_BUCKET ||
        process.env.R2_BUCKET_NAME;

      if (!bucket) return false;

      const cmd = new HeadBucketCommand({
        Bucket: bucket,
      });

      await this.s3.send(cmd);
      return true;
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

  // =====================================================
  // Socket Health Check — Production Ready
  // =====================================================
  async checkSocket() {
    try {
      const backend =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.INTERNAL_BACKEND_URL ||
        'https://api.phlyphant.com';

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const url = `${backend}/socket.io/?EIO=4&transport=polling`;

      const r = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          Origin:
            process.env.NEXT_PUBLIC_SITE_URL ||
            'https://phlyphant.com',
          'User-Agent': 'SocketAdapterCheckService',
          Connection: 'keep-alive',
        },
      });

      clearTimeout(timeout);

      return r.status === 200 || r.status === 204;
    } catch {
      return false;
    }
  }

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
