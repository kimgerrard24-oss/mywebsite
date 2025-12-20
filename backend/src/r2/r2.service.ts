// backend/src/r2/r2.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly client: S3Client;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error('R2 credentials or endpoint not configured');
    }

    this.client = new S3Client({
      region: 'auto', // Cloudflare R2 requirement
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  // =========================================================
  // EXISTING: health check (DO NOT TOUCH)
  // =========================================================
  async healthCheck(): Promise<boolean> {
    return Boolean(
      process.env.R2_ENDPOINT &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME &&
        process.env.R2_PUBLIC_BASE_URL,
    );
  }

  // =========================================================
  // EXISTING: upload (DO NOT TOUCH)
  // =========================================================
  async upload(params: {
    path: string;
    buffer: Buffer;
    contentType: string;
  }) {
    const bucket = process.env.R2_BUCKET_NAME;

    if (!bucket) {
      this.logger.error('R2_BUCKET_NAME is not configured');
      throw new Error('R2 bucket not configured');
    }

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: params.path,
          Body: params.buffer,
          ContentType: params.contentType,
        }),
      );
    } catch (err) {
      this.logger.error(
        `R2 upload failed (bucket=${bucket}, key=${params.path})`,
        err as any,
      );
      throw err;
    }

    return `${process.env.R2_PUBLIC_BASE_URL}/${params.path}`;
  }

  // =========================================================
  // NEW: upload (alias for new services เช่น cover/avatar)
  // =========================================================
  async uploadObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    const bucket = process.env.R2_BUCKET_NAME;

    if (!bucket) {
      this.logger.error('R2_BUCKET_NAME is not configured');
      throw new Error('R2 bucket not configured');
    }

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
        }),
      );
    } catch (err) {
      this.logger.error(
        `R2 uploadObject failed (bucket=${bucket}, key=${params.key})`,
        err as any,
      );
      throw err;
    }
  }

  // =========================================================
  // NEW: safe delete by public URL
  // =========================================================
  async safeDeleteByUrl(url: string): Promise<void> {
    const bucket = process.env.R2_BUCKET_NAME;
    const publicBase = process.env.R2_PUBLIC_BASE_URL;

    if (!bucket || !publicBase) {
      return; // fail-soft ตาม policy
    }

    if (!url.startsWith(publicBase)) {
      return; // URL ไม่ใช่ของเรา ไม่ลบ
    }

    const key = url.replace(`${publicBase}/`, '').trim();
    if (!key) return;

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (err) {
      this.logger.warn(
        `R2 safeDeleteByUrl failed (bucket=${bucket}, key=${key})`,
      );
    }
  }

  // =========================================================
  // NEW: build public CDN URL
  // =========================================================
  buildPublicUrl(key: string): string {
    const base = process.env.R2_PUBLIC_BASE_URL;
    if (!base) {
      throw new Error('R2_PUBLIC_BASE_URL is not configured');
    }

    return `${base}/${key}`;
  }

}
