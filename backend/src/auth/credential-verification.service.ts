// backend/src/auth/credential-verification.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { RedisService } from '../redis/redis.service';

export type VerificationScope =
  | 'ACCOUNT_LOCK'
  | 'PROFILE_EXPORT'
  | 'EMAIL_CHANGE'
  | 'PASSWORD_CHANGE'
  | 'PHONE_CHANGE';


@Injectable()
export class CredentialVerificationService {
  private readonly logger = new Logger(
    CredentialVerificationService.name,
  );

  constructor(
    private readonly redis: RedisService,
  ) {}
  

  generateToken(scope?: VerificationScope): {
  raw: string;
  hash: string;
  scope?: VerificationScope;
} {

    const raw = randomBytes(32).toString('hex');

    const hash = createHash('sha256')
      .update(raw)
      .digest('hex');

    return { raw, hash, scope };

  }

  getExpiry(minutes = 10): Date {
    return new Date(Date.now() + minutes * 60_000);
  }

  // ====================================================
  // ✅ mark session as verified for sensitive action
  // ====================================================
  async markSessionVerified(params: {
    userId: string;
    jti: string;
    scope: VerificationScope;
    ttlSeconds: number;
  }): Promise<void> {
    const { userId, jti, scope, ttlSeconds } = params;

    const key = `session:verified:${scope}:${jti}`;

    try {
      await this.redis.set(
        key,
        {
          userId,
          scope,
          verifiedAt: new Date().toISOString(),
        },
        ttlSeconds, // ✅ TTL here
      );
    } catch (err) {
      this.logger.warn(
        `[MARK_SESSION_VERIFIED_FAILED] user=${userId} scope=${scope}`,
      );
      // fail-soft
    }
  }

  // ====================================================
  // ✅ check verified session (used by account-lock)
  // ====================================================
  async isSessionVerified(params: {
  jti: string;
  scope: VerificationScope;
}): Promise<boolean> {

    const key = `session:verified:${params.scope}:${params.jti}`;

    try {
      const val = await this.redis.get(key);
      return Boolean(val);
    } catch {
      return false;
    }
  }

  async consumeVerifiedSession(params: {
  jti: string;
  scope: VerificationScope;
}): Promise<boolean> {
  const key = `session:verified:${params.scope}:${params.jti}`;

  try {
    const val = await this.redis.get(key);
    if (!val) return false;

    await this.redis.del(key); // 🔥 consume once
    return true;
  } catch {
    return false;
  }
}

async assertSessionVerified(params: {
  jti: string;
  scope: VerificationScope;
}): Promise<void> {
  const ok = await this.consumeVerifiedSession(params);

  if (!ok) {
    throw new Error(
      `Sensitive action verification required: ${params.scope}`,
    );
  }
}


}
