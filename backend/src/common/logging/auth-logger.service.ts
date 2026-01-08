// backend/src/common/logging/auth-logger.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as crypto from 'crypto';

type SecuritySeverity = 'info' | 'warning' | 'error';

@Injectable()
export class AuthLoggerService {
  private readonly logger = new Logger('AuthEvent');

  // =========================
  // Utils
  // =========================

  private getRealIp(ip: string): string {
    if (!ip) return '';
    if (ip.includes(',')) return ip.split(',')[0].trim();
    return ip.replace('::ffff:', '').trim();
  }

  private hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private captureSecurityEvent(params: {
    type: string;
    severity: SecuritySeverity;
    data?: Record<string, any>;
    userId?: string;
  }) {
    try {
      Sentry.withScope((scope) => {
        scope.setTag('event.type', params.type);
        scope.setTag('event.source', 'auth');
        scope.setLevel(params.severity);

        if (params.userId) {
          scope.setUser({ id: params.userId });
        }

        if (params.data) {
          scope.setContext('security', params.data);
        }

        Sentry.captureMessage('security_event');
      });
    } catch {
      // must never affect auth flow
    }
  }

  // =========================
  // Public API (unchanged)
  // =========================

  logLoginSuccess(userId: string, ip: string) {
    const realIp = this.getRealIp(ip);

    // local log (ops)
    this.logger.log(`LOGIN_SUCCESS user=${userId} ip=${realIp}`);

    // breadcrumb for trace context
    try {
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'LOGIN_SUCCESS',
        level: 'info',
        data: { ip: realIp },
      });
    } catch {}

    // security event
    this.captureSecurityEvent({
      type: 'auth.login.success',
      severity: 'info',
      userId,
      data: { ip: realIp },
    });
  }

  logLoginFail(email: string, ip: string) {
    const realIp = this.getRealIp(ip);
    const hashedEmail = this.hash(email);

    // local log
    this.logger.warn(`LOGIN_FAIL emailHash=${hashedEmail} ip=${realIp}`);

    // security event (no raw email)
    this.captureSecurityEvent({
      type: 'auth.login.fail',
      severity: 'warning',
      data: {
        emailHash: hashedEmail,
        ip: realIp,
      },
    });
  }

  logSuspiciousLogin(
    userId: string,
    ip: string,
    reason: string,
  ) {
    const realIp = this.getRealIp(ip);

    // local log
    this.logger.warn(
      `SUSPICIOUS_LOGIN user=${userId} ip=${realIp} reason=${reason}`,
    );

    // security event
    this.captureSecurityEvent({
      type: 'auth.login.suspicious',
      severity: 'warning',
      userId,
      data: {
        ip: realIp,
        reason,
      },
    });
  }

  logRateLimitHit(ip: string, path: string) {
    const realIp = this.getRealIp(ip);

    // local log
    this.logger.warn(
      `RATE_LIMIT_HIT ip=${realIp} path=${path}`,
    );

    // security event
    this.captureSecurityEvent({
      type: 'security.rate_limit.hit',
      severity: 'warning',
      data: {
        ip: realIp,
        path,
      },
    });
  }

  logJwtInvalid(tokenId: string, reason: string) {
    const hashedToken = this.hash(tokenId);

    // local log
    this.logger.error(
      `JWT_INVALID tokenHash=${hashedToken} reason=${reason}`,
    );

    // security event (never send raw token)
    this.captureSecurityEvent({
      type: 'auth.jwt.invalid',
      severity: 'error',
      data: {
        tokenHash: hashedToken,
        reason,
      },
    });
  }
}
