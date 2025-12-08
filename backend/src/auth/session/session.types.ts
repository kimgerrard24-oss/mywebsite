// src/auth/session/session.types.ts

export interface SessionPayload {
  userId: string;
  email: string;
  roles: string[];
  // เพิ่ม field อื่นได้ เช่น username, avatar ฯลฯ
}

export interface StoredSessionData {
  payload: SessionPayload;
  refreshTokenHash: string; // argon2 hash ของ refresh token
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string; // ISO string
}
