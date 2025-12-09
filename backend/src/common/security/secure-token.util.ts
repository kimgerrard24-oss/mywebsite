// src/common/security/secure-token.util.ts

import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';

/**
 * Generate a cryptographically secure random token (raw)
 * Will be sent to user via email (in URL)
 */
export function generateSecureToken(length = 32): string {
  // length = bytes, hex string will be length * 2 characters
  return randomBytes(length).toString('hex');
}

/**
 * Hash token for storing in DB (similar to hashed password)
 */
export async function hashToken(token: string): Promise<string> {
  return argon2.hash(token);
}

/**
 * Compare raw token (from user) with stored hash
 * (สำหรับใช้ตอนทำ reset password ตัวจริงในอนาคต)
 */
export async function verifyTokenHash(
  token: string,
  tokenHash: string,
): Promise<boolean> {
  return argon2.verify(tokenHash, token);
}
