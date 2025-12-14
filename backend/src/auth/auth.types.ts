// backend/src/auth/auth.types.ts

/**
 * ============================================
 * Auth Domain Types
 * ============================================
 * - Used by AuthService only
 * - No Prisma / Controller coupling
 * - Production-grade & extensible
 */

/**
 * Input for local user registration
 * (email + password based)
 */
export interface RegisterUserInput {
  email: string;
  username: string;
  password: string;
}

/**
 * Input for local login
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Internal representation of an authenticated user
 *  Safe fields only (no password / token)
 */
export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}

/**
 * Result after successful authentication
 */
export interface AuthSessionResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Metadata attached to a session
 * (used for audit / security)
 */
export interface SessionMeta {
  ip?: string | null;
  userAgent?: string | null;
  deviceId?: string | null;
}
