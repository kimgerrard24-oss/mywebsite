// src/common/security/secure-token.util.ts

import { randomBytes, createHash } from 'crypto';

/**
 * Generate cryptographically secure random token (URL-safe)
 */
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex'); // 64 chars for 32 bytes
}

/**
 * Hash token for DB storage (fast + safe for high-entropy tokens)
 */
export function hashToken(token: string): string {
  const normalized = token.trim();
  return createHash('sha256').update(normalized).digest('hex');
}

