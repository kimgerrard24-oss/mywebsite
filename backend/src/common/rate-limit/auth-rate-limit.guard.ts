// src/common/rate-limit/auth-rate-limit-guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from './rate-limit.service';
import { RATE_LIMIT_CONTEXT_KEY } from './rate-limit.decorator';
import { RateLimitAction } from './rate-limit.policy';
import { SecurityEventService } from '../security/security-event.service';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(
    private readonly rlService: RateLimitService,
    private readonly reflector: Reflector,
    private readonly securityEvent: SecurityEventService,
  ) {}

  private extractRealIp(req: Request): string {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string') {
      return xff.split(',')[0].trim().replace(/^::ffff:/, '');
    }
    const ip = req.socket?.remoteAddress || req.ip || '';
    return String(ip).replace(/^::ffff:/, '');
  }

  private normalizeIp(ip: string): string {
    if (!ip) return 'unknown';
    return (
      ip
        .trim()
        .replace(/^::ffff:/, '')
        .replace(/:\d+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_') || 'unknown'
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    let path = (req.path || '').toLowerCase();
    if (path.endsWith('/')) path = path.slice(0, -1);

    // ---------------- bypasses ----------------
    if (req.method === 'OPTIONS' || req.method === 'HEAD') return true;
    if (path === '/favicon.ico') return true;
    if (path.startsWith('/_next') || path.startsWith('/static')) return true;

    const internal = req.headers['x-internal-health'];
    if (
      internal &&
      typeof internal === 'string' &&
      process.env.INTERNAL_HEALTH_TOKEN &&
      internal === process.env.INTERNAL_HEALTH_TOKEN
    ) {
      return true;
    }

    if (
      path === '/system-check' ||
      path === '/health' ||
      path.startsWith('/health') ||
      path.startsWith('/system-check')
    ) {
      return true;
    }

    if (path.startsWith('/auth/session-check')) return true;
    if (path.startsWith('/auth/google')) return true;
    if (path.startsWith('/auth/facebook')) return true;

    const isLoginPost =
      req.method === 'POST' &&
      (path.endsWith('/login') ||
        path.includes('/auth/local/login') ||
        path.includes('/auth/login'));

    if (isLoginPost) return true;

    if (path.startsWith('/auth/local/register')) return true;
    if (path.startsWith('/auth/local/refresh')) return true;
    // ------------------------------------------

    const action =
      this.reflector.get<RateLimitAction>(
        RATE_LIMIT_CONTEXT_KEY,
        context.getHandler(),
      ) || null;

    if (action === 'login') return true;
    if (!action) return true;

    const rawIp = this.extractRealIp(req);
    const ipKey = this.normalizeIp(rawIp);

    let key = ipKey;

    // ===============================
// email-based flows (anti-NAT block)
// ===============================
if (action === 'requestPasswordReset') {
  const email =
    typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';

  if (email) {
    key = `${email}:${ipKey}`.replace(/[^a-z0-9_-]/g, '_');
  }
}


// token-based flows
if (
  action === 'confirmPasswordReset' ||
  action === 'confirmSetPassword' ||
  action === 'emailVerify' ||
  action === 'phoneChangeConfirm'
) {
  const token =
    (req.body && (req.body.token || req.query?.token)) || null;

  if (typeof token === 'string' && token.length > 10) {
    key = `token:${token.slice(0, 32)}`; // or hash(token)
  }
}

const info = await this.rlService.consume(action, key);


    // 🔴 FIX: เช็ค blocked โดยตรง
   if (info.blocked) {
  res.setHeader('Retry-After', String(info.retryAfterSec));
  res.setHeader('X-RateLimit-Limit', String(info.limit));
  res.setHeader('X-RateLimit-Remaining', '0');
  res.setHeader('X-RateLimit-Reset', String(info.reset));

  // ===============================
  // 🔐 Security Event: rate-limit auth
  // ===============================
  try {
    this.securityEvent.log({
      type: 'security.rate_limit.hit',
      severity: 'warning',
      meta: {
        scope: 'auth',
        action,
        ip: rawIp,
        path,
        blocked: true,
      },
    });
  } catch {
    // must not affect auth flow
  }

  return false;
}


    res.setHeader('X-RateLimit-Limit', String(info.limit));
    res.setHeader('X-RateLimit-Remaining', String(info.remaining));
    res.setHeader('X-RateLimit-Reset', String(info.reset));

    return true;
  }
}
