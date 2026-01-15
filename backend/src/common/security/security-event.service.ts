// backend/src/common/security/security-event.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as crypto from 'crypto';

export type SecurityEventSeverity =
  | 'info'
  | 'warning'
  | 'error';

export type SecurityEventType =
  // ===== AUTH =====
  | 'auth.login.success'
  | 'auth.login.fail'
  | 'auth.login.suspicious'
  | 'auth.login.user_not_found'
  | 'auth.login.account_disabled'
  | 'auth.login.missing_password_hash'
  | 'auth.login.hash_verify_error'
  | 'auth.login.password_mismatch'
  | 'auth.logout'

   // ✅ REGISTER
  | 'auth.register.success'
  | 'auth.register.conflict'

  // ===== JWT / SESSION =====
  | 'auth.jwt.missing_token'
  | 'auth.jwt.secret_missing'
  | 'auth.jwt.payload_invalid'
  | 'auth.jwt.verify_failed'
  | 'auth.jwt.invalid'
  | 'auth.session.missing'
  | 'auth.session.created'
  | 'auth.session.revoked'
  | 'auth.redis.session_invalid'

  // ===== ABUSE / RATE LIMIT =====
  | 'security.rate_limit.hit'
  | 'security.abuse.detected'

  // ===== SYSTEM =====
  | 'system.misconfiguration'
  | 'system.redis_error';

export interface SecurityEventPayload {
  type: SecurityEventType;
  severity: SecurityEventSeverity;

  /** backend authority user id (never email / username) */
  userId?: string;

  /** client ip (already sanitized) */
  ip?: string;

  /** hashed identifiers only */
  tokenHash?: string;
  emailHash?: string;

  /** free-form but non-sensitive */
  reason?: string;
  path?: string;

  /** extra safe diagnostic info */
  meta?: Record<string, any>;
}

@Injectable()
export class SecurityEventService {
  private readonly logger =
    new Logger('SecurityEvent');

  // ============================
  // Public API (Domain-safe)
  // ============================

  log(event: SecurityEventPayload) {
    // 1) Always write local ops log
    this.logToConsole(event);

    // 2) Send to monitoring sink (Sentry)
    this.sendToSentry(event);
  }

  // Convenience helpers (optional usage)

  loginSuccess(userId: string, ip?: string) {
    this.log({
      type: 'auth.login.success',
      severity: 'info',
      userId,
      ip,
    });
  }

  loginFail(emailHash: string, ip?: string) {
    this.log({
      type: 'auth.login.fail',
      severity: 'warning',
      emailHash,
      ip,
    });
  }

  jwtInvalid(
    tokenHash: string,
    reason: string,
  ) {
    this.log({
      type: 'auth.jwt.invalid',
      severity: 'error',
      tokenHash,
      reason,
    });
  }

  rateLimitHit(ip: string, path: string) {
    this.log({
      type: 'security.rate_limit.hit',
      severity: 'warning',
      ip,
      path,
    });
  }

  suspicious(
    userId: string | undefined,
    reason: string,
    meta?: Record<string, any>,
  ) {
    this.log({
      type: 'security.abuse.detected',
      severity: 'warning',
      userId,
      reason,
      meta,
    });
  }

  systemMisconfig(reason: string) {
    this.log({
      type: 'system.misconfiguration',
      severity: 'error',
      reason,
    });
  }

  // ============================
  // Internal
  // ============================

  private logToConsole(
    event: SecurityEventPayload,
  ) {
    const base = {
      type: event.type,
      severity: event.severity,
      userId: event.userId,
      ip: event.ip,
      path: event.path,
      reason: event.reason,
    };

    if (event.severity === 'error') {
      this.logger.error(JSON.stringify(base));
    } else if (event.severity === 'warning') {
      this.logger.warn(JSON.stringify(base));
    } else {
      this.logger.log(JSON.stringify(base));
    }
  }

  private sendToSentry(
    event: SecurityEventPayload,
  ) {
    try {
      Sentry.withScope((scope) => {
        // -------------------------
        // Tags (for filtering)
        // -------------------------
        scope.setTag(
          'event.type',
          event.type,
        );
        scope.setTag(
          'event.severity',
          event.severity,
        );
        scope.setTag(
          'event.source',
          'security',
        );
        scope.setTag(
          'service',
          process.env.SERVICE_NAME ||
            'backend-api',
        );
        scope.setTag(
          'env',
          process.env.NODE_ENV ||
            'production',
        );

        // -------------------------
        // User (safe)
        // -------------------------
        if (event.userId) {
          scope.setUser({
            id: event.userId,
          });
        }

        // -------------------------
        // Context (sanitized)
        // -------------------------
        const ctx: Record<string, any> =
          {};

        if (event.ip) ctx.ip = event.ip;
        if (event.path)
          ctx.path = event.path;
        if (event.reason)
          ctx.reason = event.reason;
        if (event.tokenHash)
          ctx.tokenHash = event.tokenHash;
        if (event.emailHash)
          ctx.emailHash = event.emailHash;
        if (event.meta)
          ctx.meta = event.meta;

        if (Object.keys(ctx).length > 0) {
          scope.setContext(
            'security',
            ctx,
          );
        }

        // -------------------------
        // Level mapping
        // -------------------------
        scope.setLevel(event.severity);

        // -------------------------
        // Emit
        // -------------------------
        Sentry.captureMessage(
          'security_event',
        );
      });
    } catch {
      // must never affect request flow
    }
  }

  // ============================
  // Utilities (for callers)
  // ============================

  hash(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
  }
}
