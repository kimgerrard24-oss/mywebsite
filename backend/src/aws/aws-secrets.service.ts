// ==============================
// file: src/aws/aws.service.ts
// ==============================

import { Injectable, Logger } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name);

  // AWS Secrets Manager client
  private readonly secrets: SecretsManagerClient;

  constructor() {
    // ---------------------------------------------------------
    // AWS Region (safe default for your production)
    // ---------------------------------------------------------
    const region =
      process.env.AWS_REGION?.trim() ||
      process.env.AWS_DEFAULT_REGION?.trim() ||
      'ap-southeast-7';

    // ---------------------------------------------------------
    // Initialize AWS Secrets Manager
    // ---------------------------------------------------------
    this.secrets = new SecretsManagerClient({
      region,
    });
  }

  // =========================================================
  // GET SECRET — used by system-check
  // =========================================================
  async getSecret(secretName: string): Promise<string | null> {
    try {
      if (!secretName || secretName.trim() === '') {
        this.logger.error('Secret name is missing.');
        return null;
      }

      const cmd = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const result = await this.secrets.send(cmd);

      return result.SecretString || null;
    } catch (err: any) {
      const msg = err?.message ? err.message : String(err);
      this.logger.error(`Failed to load secret from AWS Secrets Manager: ${msg}`);
      return null;
    }
  }
}
