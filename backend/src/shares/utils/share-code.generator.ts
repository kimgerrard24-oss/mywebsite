// backend/src/shares/utils/share-code.generator.ts

import { randomBytes } from 'crypto';

export function generateShareCode(): string {
  return randomBytes(6).toString('base64url');
}
