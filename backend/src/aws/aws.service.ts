// ==============================
// file: src/aws/aws.service.ts
// ==============================
import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getCloudfrontSignedUrl } from '@aws-sdk/cloudfront-signer';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as mime from 'mime-types';

@Injectable()
export class AwsService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly folder: string;
  private readonly cfUrl: string;
  private readonly keyPairId: string;
  private readonly privateKey: string;
  private readonly signedExpiresSec: number;
  private readonly logger = new Logger(AwsService.name);

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-7',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    this.bucket =
      process.env.AWS_S3_BUCKET ||
      process.env.S3_BUCKET ||
      process.env.AWS_BUCKET_NAME ||
      process.env.R2_BUCKET_NAME ||
      '';

    if (!this.bucket) {
      this.logger.error('No S3/R2 bucket configured in environment variables');
    }

    this.folder = process.env.S3_UPLOAD_FOLDER || 'uploads';

    this.cfUrl = process.env.CLOUDFRONT_URL || process.env.R2_ENDPOINT || '';

    this.keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID || '';

    const pkEnv = process.env.CLOUDFRONT_PRIVATE_KEY || '';
    const pkBase64 = process.env.CLOUDFRONT_PRIVATE_KEY_BASE64 || '';

    let keyRaw = pkEnv;

    if (!keyRaw && pkBase64) {
      try {
        keyRaw = Buffer.from(pkBase64, 'base64').toString('utf-8');
      } catch {
        this.logger.error('Failed to decode CLOUDFRONT_PRIVATE_KEY_BASE64');
      }
    }

    const cleanedKey = keyRaw.replace(/\\n/g, '\n').trim();
    this.privateKey = cleanedKey;

    this.signedExpiresSec = Number(process.env.SIGNED_URL_EXPIRES_SECONDS || '3600');

    if (!this.bucket) {
      this.logger.warn('Bucket not configured; upload/sign-url operations may fail.');
    }

    if ((this.keyPairId && !this.privateKey) || (!this.keyPairId && this.privateKey)) {
      this.logger.warn('CloudFront signing is incomplete (missing keyPairId or privateKey).');
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

    if (this.cfUrl && this.keyPairId && this.privateKey) {
      try {
        const url = `${this.cfUrl.replace(/\/+$/, '')}/${cleanKey}`;
        const expires = Math.floor(Date.now() / 1000) + this.signedExpiresSec;

        const signed = getCloudfrontSignedUrl({
          url,
          keyPairId: this.keyPairId,
          privateKey: this.privateKey,
          dateLessThan: new Date(expires * 1000),
        });

        return signed;
      } catch (e) {
        const msg = (e && (e as any).message) ? (e as any).message : String(e);
        this.logger.error('CloudFront signed URL generation failed: ' + msg);
      }
    }

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
      this.logger.error('S3 presigned URL generation failed: ' + msg);
      throw new Error('Signed URL generation failed');
    }
  }
}
