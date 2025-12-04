import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as crypto from 'crypto';

@Injectable()
export class AuthLoggerService {
  private readonly logger = new Logger('AuthEvent');

  private getRealIp(ip: string): string {
    if (!ip) return '';

    let value = String(ip).trim();

    // Cloudflare forwarded list
    if (value.includes(',')) {
      value = value.split(',')[0].trim();
    }

    // remove IPv6 mapped prefix
    value = value.replace(/^::ffff:/, '');

    // remove port if present
    value = value.replace(/:\d+$/, '');

    // normalize final
    return value.trim();
  }

  private hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  logLoginSuccess(userId: string, ip: string) {
    const realIp = this.getRealIp(ip);

    this.logger.log(`LOGIN_SUCCESS user=${userId} ip=${realIp}`);

    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'LOGIN_SUCCESS',
      level: 'info',
      data: { userId, ip: realIp },
    });
  }

  logLoginFail(email: string, ip: string) {
    const realIp = this.getRealIp(ip);
    const hashedEmail = this.hash(email);

    this.logger.warn(`LOGIN_FAIL emailHash=${hashedEmail} ip=${realIp}`);

    Sentry.captureEvent({
      message: 'LOGIN_FAIL',
      level: 'warning',
      extra: { emailHash: hashedEmail, ip: realIp },
    });
  }

  logSuspiciousLogin(userId: string, ip: string, reason: string) {
    const realIp = this.getRealIp(ip);

    this.logger.warn(
      `SUSPICIOUS_LOGIN user=${userId} ip=${realIp} reason=${reason}`,
    );

    Sentry.captureEvent({
      message: 'SUSPICIOUS_LOGIN',
      level: 'warning',
      extra: { userId, ip: realIp, reason },
    });
  }

  logRateLimitHit(ip: string, path: string) {
    const realIp = this.getRealIp(ip);

    this.logger.warn(`RATE_LIMIT_HIT ip=${realIp} path=${path}`);

    Sentry.captureEvent({
      message: 'RATE_LIMIT_HIT',
      level: 'warning',
      extra: { ip: realIp, path },
    });
  }

  logJwtInvalid(tokenId: string, reason: string) {
    const hashedToken = this.hash(tokenId);

    this.logger.error(`JWT_INVALID tokenHash=${hashedToken} reason=${reason}`);

    Sentry.captureEvent({
      message: 'JWT_INVALID_SIGNATURE',
      level: 'error',
      extra: { tokenHash: hashedToken, reason },
    });
  }
}
