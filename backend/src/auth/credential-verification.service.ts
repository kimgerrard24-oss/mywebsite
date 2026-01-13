// backend/src/auth/credential-verification.service.ts

import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class CredentialVerificationService {
  generateToken(): { raw: string; hash: string } {
    const raw = randomBytes(32).toString('hex');

    const hash = createHash('sha256')
      .update(raw)
      .digest('hex');

    return { raw, hash };
  }

  getExpiry(minutes = 10): Date {
    return new Date(Date.now() + minutes * 60_000);
  }
}
