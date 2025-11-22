// ==============================
// file: src/aws/aws-secrets.service.ts
// ==============================
import { Injectable, Logger } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  GetSecretValueCommandOutput,
} from '@aws-sdk/client-secrets-manager';

type SecretValue = Record<string, unknown> | string | null;

@Injectable()
export class AwsSecretsService {
  private client: SecretsManagerClient;
  private logger = new Logger(AwsSecretsService.name);

  constructor() {
    // Configure client using environment variables if provided.
    // If no explicit credentials are present, the SDK will fallback to instance role / environment chain.
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || undefined;

    const creds =
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
          }
        : undefined;

    const clientConfig: any = {};
    if (region) clientConfig.region = region;
    if (creds) clientConfig.credentials = creds;

    this.client = new SecretsManagerClient(clientConfig);
  }

  /**
   * Fetch a secret from AWS Secrets Manager.
   * - If DISABLE_AWS_SECRET=true, this will return null immediately.
   * - If secret content is JSON, it will be parsed and returned as an object.
   * - If secret content is plain string, the string will be returned.
   *
   * Returns null when secret is missing or cannot be fetched.
   */
  async getSecret(secretName: string): Promise<SecretValue> {
    if (!secretName) return null;

    // Allow local / dev override: if DISABLE_AWS_SECRET is set, skip fetching.
    if (String(process.env.DISABLE_AWS_SECRET || '').toLowerCase() === 'true') {
      this.logger.debug(`AwsSecretsService: fetching secrets is disabled (DISABLE_AWS_SECRET=true). Skipping: ${secretName}`);
      return null;
    }

    try {
      const cmd = new GetSecretValueCommand({ SecretId: secretName });
      const res: GetSecretValueCommandOutput = await this.client.send(cmd);

      // Prefer SecretString
      if (typeof res.SecretString === 'string' && res.SecretString.length > 0) {
        const txt = res.SecretString.trim();
        try {
          return JSON.parse(txt);
        } catch {
          // not JSON — return raw string
          return txt;
        }
      }

      // Fallback to SecretBinary
      if (res.SecretBinary) {
        const buff = Buffer.from(res.SecretBinary as Uint8Array);
        const txt = buff.toString('utf8').trim();
        try {
          return JSON.parse(txt);
        } catch {
          return txt;
        }
      }

      return null;
    } catch (err: unknown) {
      // Log error without exposing secret contents
      this.logger.error(`Failed to fetch secret "${secretName}": ${(err as any)?.message ?? String(err)}`);
      return null;
    }
  }

  /**
   * Convenience helper: fetch the OAuth client redirect mapping secret (if used).
   * This reads the environment variable AWS_OAUTH_SECRET_NAME and returns its parsed value.
   */
  async getOAuthRedirectSecret(): Promise<SecretValue> {
    const name = process.env.AWS_OAUTH_SECRET_NAME || process.env.AWS_SECRET_NAME || '';
    if (!name) {
      this.logger.debug('AwsSecretsService: no AWS_OAUTH_SECRET_NAME or AWS_SECRET_NAME configured');
      return null;
    }
    return this.getSecret(name);
  }
}
