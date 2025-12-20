import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class PresignService {
  private readonly client: S3Client;
  private readonly publicBaseUrl: string;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

    if (!endpoint || !accessKey || !secretKey || !publicBaseUrl) {
      throw new Error('R2 presign configuration missing');
    }

    this.publicBaseUrl = publicBaseUrl.replace(/\/+$/, '');

    this.client = new S3Client({
      region: 'auto', 
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

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresInSeconds,
    });

    /**
     * 🔑 IMPORTANT
     * - Signed correctly with R2 endpoint
     * - But browser must upload via custom domain (CORS-safe)
     */
    return signedUrl.replace(
      /^https?:\/\/[^/]+/,
      this.publicBaseUrl,
    );
  }
}
