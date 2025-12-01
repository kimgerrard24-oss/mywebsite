import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class AuthLoggerService {
  private readonly logger = new Logger('AuthEvent');

  logLoginSuccess(userId: string, ip: string) {
    this.logger.log(`LOGIN_SUCCESS user=${userId} ip=${ip}`);
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'LOGIN_SUCCESS',
      level: 'info',
      data: { userId, ip },
    });
  }

  logLoginFail(email: string, ip: string) {
    this.logger.warn(`LOGIN_FAIL email=${email} ip=${ip}`);
    Sentry.captureMessage('LOGIN_FAIL', {
      level: 'warning',
      extra: { email, ip },
    });
  }

  logSuspiciousLogin(userId: string, ip: string, reason: string) {
    this.logger.warn(
      `SUSPICIOUS_LOGIN user=${userId} ip=${ip} reason=${reason}`,
    );
    Sentry.captureMessage('SUSPICIOUS_LOGIN', {
      level: 'warning',
      extra: { userId, ip, reason },
    });
  }

  logRateLimitHit(ip: string, path: string) {
    this.logger.warn(`RATE_LIMIT_HIT ip=${ip} path=${path}`);
    Sentry.captureMessage('RATE_LIMIT_HIT', {
      level: 'warning',
      extra: { ip, path },
    });
  }

  logJwtInvalid(tokenId: string, reason: string) {
    this.logger.error(`JWT_INVALID token=${tokenId} reason=${reason}`);
    Sentry.captureMessage('JWT_INVALID_SIGNATURE', {
      level: 'error',
      extra: { tokenId, reason },
    });
  }
}
