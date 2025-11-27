// src/r2/r2.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly client: S3Client;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;

    // FIXED: AWS SDK v3 requires a valid region
    this.client = new S3Client({
      region: 'us-east-1', // FIXED
      endpoint,
      credentials: {
        accessKeyId: accessKey || '',
        secretAccessKey: secretKey || '',
      },
    });
  }

  // FIXED: ไม่ยิง HeadBucketCommand (production R2 มักเป็น private)
  // ตรวจเฉพาะ ENV ที่จำเป็น แค่นี้เพียงพอสำหรับ health check
  async healthCheck(): Promise<boolean> {
    try {
      const required = [
        process.env.R2_ENDPOINT,
        process.env.R2_ACCESS_KEY_ID,
        process.env.R2_SECRET_ACCESS_KEY,
        process.env.R2_BUCKET_NAME,
      ];

      const ok = required.every(Boolean);
      return ok;
    } catch {
      return false;
    }
  }
}
