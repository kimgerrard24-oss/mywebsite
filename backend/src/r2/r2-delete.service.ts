// backend/src/r2/r2-delete.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class R2DeleteService {
  private readonly logger = new Logger(R2DeleteService.name);
  private readonly client: S3Client | null = null;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      // ❗ fail-soft: cleanup job ต้องไม่ทำให้ app พัง
      this.logger.error(
        'R2DeleteService is not configured properly (missing credentials or endpoint)',
      );
      return;
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * ❗ Fail-soft delete
   * - ห้าม throw
   * - ใช้เฉพาะ background job / cleanup
   */
  async deleteObject(objectKey: string): Promise<void> {
    const bucket = process.env.R2_BUCKET_NAME;

    if (!this.client || !bucket || !objectKey) {
      return; // fail-soft
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: objectKey,
        }),
      );

      this.logger.log(`R2 deleted: ${objectKey}`);
    } catch (err) {
      // ❗ สำคัญ: log อย่างเดียว ห้าม throw
      this.logger.error(
        `Failed to delete R2 object: ${objectKey}`,
        err as any,
      );
    }
  }
}
