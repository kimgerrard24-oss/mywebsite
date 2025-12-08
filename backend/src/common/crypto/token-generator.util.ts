// src/common/crypto/token-generator.util.ts

import { randomBytes } from 'crypto';

// สร้าง access/refresh token แบบ random ปลอดภัย
export function generateSecureToken(byteLength = 32): string {
  // ใช้ hex ปลอดภัยแน่นอนทุกเวอร์ชัน Node
  return randomBytes(byteLength).toString('hex');
}
