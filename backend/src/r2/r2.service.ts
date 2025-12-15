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
      region: 'us-east-1', 
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
    await this.client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: params.path,
        Body: params.buffer,
        ContentType: params.contentType,
      }),
    );

    return `${process.env.R2_PUBLIC_BASE_URL}/${params.path}`;
  }
}
