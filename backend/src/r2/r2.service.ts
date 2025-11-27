// src/r2/r2.service.ts

import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly client: S3Client;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKey || '',
        secretAccessKey: secretKey || '',
      },
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const bucket = process.env.R2_BUCKET_NAME;
      if (!bucket) return false;

      await this.client.send(
        new HeadBucketCommand({ Bucket: bucket }),
      );

      return true;
    } catch (err) {
      return false;
    }
  }
}
