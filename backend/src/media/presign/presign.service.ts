import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class PresignService {
  private readonly client: S3Client;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error('R2 presign credentials or endpoint not configured');
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

  async createUploadUrl(params: {
    bucket: string;
    key: string;
    contentType: string;
    expiresInSeconds: number;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      ContentType: params.contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: params.expiresInSeconds,
    });
  }
}
