// backend/src/auth/services/revoke-user-sessions.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { AuditService } from '../audit.service';

@Injectable()
export class RevokeUserSessionsService {
  private readonly logger = new Logger(
    RevokeUserSessionsService.name,
  );

  constructor(
    private readonly redis: RedisService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Revoke all active sessions of user
   * - Redis is authority
   * - MUST NOT reset TTL
   * - Used for: ban, password change, security events
   */
  async revokeAll(userId: string): Promise<void> {
    try {
      await this.redis.revokeAllSessionsByUser(userId);

      // ===============================
      // ✅ SECURITY AUDIT (fail-soft)
      // ===============================
      try {
        await this.audit.createLog({
          userId,
          action: 'session.revoke_all',
          success: true,
        });
      } catch (err) {
        this.logger.warn(
          `audit log failed for revokeAll user=${userId}`,
        );
      }
    } catch (err) {
      // ===============================
      // 🚨 CRITICAL SECURITY EVENT
      // ===============================
      this.logger.error(
        `FAILED to revoke sessions for user=${userId}`,
        err instanceof Error ? err.stack : undefined,
      );

      // audit failure (still fail-soft to caller)
      try {
        await this.audit.createLog({
          userId,
          action: 'session.revoke_all',
          success: false,
          reason: 'redis_revoke_failed',
        });
      } catch {}

      // IMPORTANT:
      // ❗ do NOT throw — caller flow must not break
    }
  }
  
}
