// backend/src/r2/r2.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
      region: 'auto', // สำคัญ: Cloudflare R2 ต้องใช้ auto
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(
      process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_BASE_URL
    );
  }

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
}
