// ==============================
// file: src/aws/aws.service.ts
// ==============================

import { Injectable, Logger } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { fromEnv } from '@aws-sdk/credential-providers';

@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name);

  private readonly secrets: SecretsManagerClient;

  constructor() {
    const region =
      process.env.AWS_REGION?.trim() ||
      process.env.AWS_DEFAULT_REGION?.trim() ||
      'ap-southeast-7';

    // ---------------------------------------------------------
    // FIXED: Load credentials from environment (safe & required)
    // ---------------------------------------------------------
    this.secrets = new SecretsManagerClient({
      region,
      credentials: fromEnv(), // <---------- IMPORTANT
    });
  }

  // =========================================================
  // GET SECRET
  // =========================================================
  async getSecret(secretName: string): Promise<string | null> {
    try {
      if (!secretName || secretName.trim() === '') {
        this.logger.error('Secret name missing');
        return null;
      }

      const cmd = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const result = await this.secrets.send(cmd);

      return result.SecretString || null;
    } catch (err: any) {
      const msg = err?.message ? err.message : String(err);
      this.logger.error(`Failed to load secret: ${msg}`);
      return null;
    }
  }
}
