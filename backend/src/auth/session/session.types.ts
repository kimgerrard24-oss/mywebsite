// backend/src/auth/session/session.types.ts

/**
 * SessionPayload:
 * ข้อมูลผู้ใช้ที่เก็บไว้ใน session
 * NOTE:
 *   โครงสร้างนี้ยังถูกต้อง แต่ flow ใหม่ของระบบ
 *   จะใช้ payload ภายใน JWT + Redis (mapped by jti)
 */
export interface SessionPayload {
  userId: string;
  email?: string;
  name?: string;
  provider?: string;
}

/**
 * StoredSessionData:
 * โครงสร้างข้อมูล session ที่ใช้กับระบบ session แบบดั้งเดิม
 *
 * หมายเหตุสำคัญ:
 * - ระบบ session model ปัจจุบัน (Hybrid JWT + Redis jti pointer)
 *   ไม่ใช้ accessTokenHash อีกต่อไป
 * - refreshTokenHash ยังเป็นรูปแบบที่ปลอดภัยและใช้ได้กับระบบใหม่
 * - ไฟล์นี้ยังคงจำเป็นเพื่อความเข้ากันได้ย้อนหลัง
 *   แต่ไม่ใช่ตัวกำหนด flow หลักใน validate-session-service
 */
export interface StoredSessionData {
  payload: SessionPayload;

  // refresh token (opaque) hashed with argon2
  refreshTokenHash: string;

  // access token hash (legacy: สำหรับ session model เก่า)
  accessTokenHash: string;

  userAgent: string | null;
  ip: string | null;

  createdAt: string;
}
