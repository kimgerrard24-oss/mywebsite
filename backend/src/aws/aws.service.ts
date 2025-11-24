// ==============================
// file: src/aws/aws.service.ts
// ==============================
import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as mime from 'mime-types';

@Injectable()
export class AwsService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly folder: string;
  private readonly signedExpiresSec: number;
  private readonly logger = new Logger(AwsService.name);

  constructor() {
    // -----------------------------
    // Cloudflare R2 only
    // -----------------------------
    const r2Endpoint = process.env.R2_ENDPOINT || '';
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID || '';
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY || '';
    const r2Bucket = process.env.R2_BUCKET_NAME || '';

    if (!r2Endpoint || !r2AccessKey || !r2SecretKey || !r2Bucket) {
      this.logger.error('Missing R2 configuration (endpoint/key/bucket)');
    }

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    this.bucket = r2Bucket;

    this.folder = process.env.S3_UPLOAD_FOLDER || 'uploads';

    this.signedExpiresSec = Number(process.env.SIGNED_URL_EXPIRES_SECONDS || '3600');

    if (!this.bucket) {
      this.logger.warn('R2 bucket not configured');
    }
  }

  async uploadBuffer(buffer: Buffer, originalName: string, contentType?: string): Promise<string> {
    const detectedType = contentType || mime.lookup(originalName) || 'application/octet-stream';

    const safeOriginal = originalName.replace(/\s+/g, '_');
    const key = `${this.folder}/${Date.now()}-${randomUUID()}-${safeOriginal}`;

    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: detectedType,
    });

    await this.s3.send(cmd);
    return key;
  }

  async generateSignedUrl(objectKey: string): Promise<string> {
    if (!this.bucket) {
      throw new Error('Bucket not configured');
    }

    const cleanKey = objectKey.replace(/^\/+/, '');

    try {
      const getCmd = new GetObjectCommand({
        Bucket: this.bucket,
        Key: cleanKey,
      });

      const signed = await getS3SignedUrl(this.s3, getCmd, {
        expiresIn: this.signedExpiresSec,
      });

      return signed;
    } catch (e) {
      const msg = (e && (e as any).message) ? (e as any).message : String(e);
      this.logger.error('R2 presigned URL generation failed: ' + msg);
      throw new Error('Signed URL generation failed');
    }
  }
}
