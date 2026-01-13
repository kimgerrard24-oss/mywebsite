// backend/src/auth/types/auth-request-user.d.ts

declare namespace Express {
  interface User {
    userId: string;
    jti: string;
  }
}
