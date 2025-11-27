// ==========================================
// file: backend/src/secrets/secrets.service.ts
// ==========================================
import { Injectable, Logger } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);

  private client = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'ap-southeast-7',
  });

  // ---------------------------------------------------------
  // Safe fetch from AWS Secrets Manager
  // ---------------------------------------------------------
  async getSecret(secretName: string): Promise<Record<string, string>> {
    try {
      if (!secretName || secretName.trim() === '') {
        this.logger.warn('getSecret called with empty secretName');
        return {};
      }

      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);

      if (!response.SecretString) {
        this.logger.warn(`Secret "${secretName}" returned empty SecretString`);
        return {};
      }

      try {
        const parsed = JSON.parse(response.SecretString);
        if (parsed && typeof parsed === 'object') {
          const out: Record<string, string> = {};
          for (const [k, v] of Object.entries(parsed)) {
            out[k] = typeof v === 'string' ? v : String(v);
          }
          return out;
        }

        this.logger.warn(`Secret "${secretName}" parsed to non-object; ignoring`);
        return {};
      } catch {
        this.logger.error(
          `Failed to parse secret "${secretName}" as JSON — ensure secret is stored as JSON.`,
        );
        return {};
      }
    } catch (err: any) {
      const msg = err?.message ? err.message : String(err);
      this.logger.error(`Failed to fetch secret "${secretName}": ${msg}`);
      return {};
    }
  }

  // ---------------------------------------------------------
  // Helper
  // ---------------------------------------------------------
  private pick(obj: Record<string, any>, keys: string[]): string {
    for (const k of keys) {
      if (typeof obj[k] === 'string' && obj[k].trim() !== '') {
        return obj[k].trim();
      }
    }
    return '';
  }

  // ---------------------------------------------------------
  // OAuth Secrets Loader
  // ---------------------------------------------------------
  async getOAuthSecrets(): Promise<Record<string, string>> {
    const envSecret =
      process.env.AWS_OAUTH_SECRET_NAME || process.env.AWS_SECRET_NAME;

    // FIXED:
    // ถ้าไม่มี secret name ให้ถือว่าใช้ .env และถือว่าผ่าน
    const secretName = envSecret && envSecret.trim() !== ''
      ? envSecret.trim()
      : null;

    const s = secretName ? await this.getSecret(secretName) : {};

    // ---------------- Google ----------------
    const googleClientId =
      this.pick(s, ['GOOGLE_CLIENT_ID', 'client_id', 'clientId']) ||
      process.env.GOOGLE_CLIENT_ID ||
      '';

    const googleClientSecret =
      this.pick(s, ['GOOGLE_CLIENT_SECRET', 'client_secret', 'clientSecret']) ||
      process.env.GOOGLE_CLIENT_SECRET ||
      '';

    let googleCallback =
      this.pick(s, [
        'GOOGLE_CALLBACK_URL',
        'GOOGLE_REDIRECT_URL',
        'redirectUri',
        'redirect_uri',
        'redirect',
        'redirect_url',
        'redirectUrl',
      ]) ||
      process.env.GOOGLE_CALLBACK_URL ||
      process.env.GOOGLE_REDIRECT_URL ||
      '';

    const FINAL_GOOGLE_CALLBACK =
      'https://api.phlyphant.com/auth/google/callback';

    googleCallback = (googleCallback || '').replace(/\/$/, '');
    if (googleCallback !== FINAL_GOOGLE_CALLBACK) {
      googleCallback = FINAL_GOOGLE_CALLBACK;
    }

    const googleRedirectAfterLogin =
      this.pick(s, [
        'GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN',
        'redirect_after_login',
        'provider_redirect',
      ]) ||
      process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN ||
      '';

    // ---------------- Facebook ----------------
    const facebookClientId =
      this.pick(s, ['FACEBOOK_CLIENT_ID']) ||
      process.env.FACEBOOK_CLIENT_ID ||
      '';

    const facebookClientSecret =
      this.pick(s, ['FACEBOOK_CLIENT_SECRET']) ||
      process.env.FACEBOOK_CLIENT_SECRET ||
      '';

    let facebookCallback =
      this.pick(s, ['FACEBOOK_CALLBACK_URL', 'FACEBOOK_REDIRECT_URL']) ||
      process.env.FACEBOOK_CALLBACK_URL ||
      process.env.FACEBOOK_REDIRECT_URL ||
      '';

    const FINAL_FACEBOOK_CALLBACK =
      'https://api.phlyphant.com/auth/facebook/callback';

    facebookCallback = (facebookCallback || '').replace(/\/$/, '');
    if (facebookCallback !== FINAL_FACEBOOK_CALLBACK) {
      facebookCallback = FINAL_FACEBOOK_CALLBACK;
    }

    const facebookRedirectAfterLogin =
      this.pick(s, [
        'FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN',
        'redirect_after_login',
        'provider_redirect',
      ]) ||
      process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
      '';

    // ---------------- Build normalized output ----------------
    const normalized: Record<string, string> = {
      GOOGLE_CLIENT_ID: googleClientId,
      GOOGLE_CLIENT_SECRET: googleClientSecret,
      GOOGLE_CALLBACK_URL: FINAL_GOOGLE_CALLBACK,
      GOOGLE_REDIRECT_URL: FINAL_GOOGLE_CALLBACK,
      GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN: googleRedirectAfterLogin,

      FACEBOOK_CLIENT_ID: facebookClientId,
      FACEBOOK_CLIENT_SECRET: facebookClientSecret,
      FACEBOOK_CALLBACK_URL: FINAL_FACEBOOK_CALLBACK,
      FACEBOOK_REDIRECT_URL: FINAL_FACEBOOK_CALLBACK,
      FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN: facebookRedirectAfterLogin,
    };

    // Inject to env
    for (const [k, v] of Object.entries(normalized)) {
      if (v && v.length > 0) process.env[k] = v;
    }

    return normalized;
  }

  // ---------------------------------------------------------
  // Cached secrets
  // ---------------------------------------------------------
  cachedOAuthSecrets(): Record<string, string> {
    return {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',
      GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL || '',
      GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN:
        process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN || '',

      FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
      FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET || '',
      FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL || '',
      FACEBOOK_REDIRECT_URL: process.env.FACEBOOK_REDIRECT_URL || '',
      FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN:
        process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN || '',
    };
  }
}
