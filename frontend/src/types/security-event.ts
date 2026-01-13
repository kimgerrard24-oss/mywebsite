// frontend/src/types/security-event.ts

export type SecurityEvent = {
  id: string;
  type: string;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

export type SecurityEventPage = {
  items: SecurityEvent[];
  nextCursor: string | null;
};
