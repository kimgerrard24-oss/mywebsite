// backend/src/auth/session/session.types.ts

export interface SessionPayload {
  userId: string;
  email?: string;
  name?: string;
  provider?: string;
}

/**
 * เก็บข้อมูล session ใน Redis
 *
 * หมายเหตุสำคัญ:
 * - ต้องมีทั้ง refreshTokenHash และ accessTokenHash
 *   เพื่อรองรับการ revoke session ได้อย่างถูกต้อง
 * - refreshTokenHash ใช้กับตัว refresh token
 * - accessTokenHash ใช้กับตัว access token
 */
export interface StoredSessionData {
  payload: SessionPayload;

  refreshTokenHash: string;
  accessTokenHash: string;

  userAgent: string | null;
  ip: string | null;
  createdAt: string;
}
