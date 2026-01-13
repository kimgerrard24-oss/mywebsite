// backend/src/users/dto/security-event.response.dto.ts

import type { SecurityEvent } from '@prisma/client';

export class SecurityEventResponseDto {
  id!: string;
  type!: string;
  ip?: string | null;
  userAgent?: string | null;
  createdAt!: string;

  static fromEntity(e: SecurityEvent): SecurityEventResponseDto {
    return {
      id: e.id,
      type: e.type,
      ip: e.ip,
      userAgent: e.userAgent,
      createdAt: e.createdAt.toISOString(),
    };
  }
}
