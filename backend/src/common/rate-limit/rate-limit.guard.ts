// src/common/rate-limit/rate-limit-guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RateLimitService } from './rate-limit.service';
import { RATE_LIMIT_CONTEXT_KEY } from './rate-limit.decorator';
import { RateLimitAction } from './rate-limit.policy';
import { SecurityEventService } from '../security/security-event.service';

export type RateLimitConsumeResult = {
  limit: number;
  remaining: number;
  retryAfterSec: number;
  reset: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

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
    const ip =
      (req.socket && (req.socket.remoteAddress as string)) ||
      (req.ip as string) ||
      '';
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

    if (
      path.startsWith('/auth/google') ||
      path.startsWith('/auth/facebook') ||
      path.startsWith('/auth/complete') ||
      path.startsWith('/auth/session-check')
    ) {
      return true;
    }

    if (
      req.method === 'POST' &&
      (
        path.endsWith('/login') ||
        path.includes('/auth/local/login') ||
        path.includes('/auth/login')
      )
    ) {
      return true;
    }

    if (path.startsWith('/auth/local/register')) return true;
    if (path.startsWith('/auth/local/refresh')) return true;
    // ------------------------------------------

    const action = this.reflector.get<RateLimitAction>(
      RATE_LIMIT_CONTEXT_KEY,
      context.getHandler(),
    );

    if (action === 'login') return true;
    if (!action) return true;

    // ---------- special logout handling ----------
    if (
      req.method === 'POST' &&
      (
        path === '/auth/local/logout' ||
        path.endsWith('/auth/local/logout')
      )
    ) {
      const rawIp = this.extractRealIp(req);
      const ipKey = this.normalizeIp(rawIp);
      const key = `rl:logout:${ipKey}`;

      const result = await this.rlService.consume('logout', key);

      if (result.blocked) {
        res.setHeader('Retry-After', String(result.retryAfterSec));
        res.setHeader('X-RateLimit-Limit', String(result.limit));
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', String(result.reset));
    
        this.logger.warn(
          `Rate limit blocked: action="logout" key="${key}" ip="${rawIp}" retryAfter=${result.retryAfterSec}`,
        );
        try {
  this.securityEvent.log({
    type: 'security.rate_limit.hit',
    severity: 'warning',
    meta: {
      scope: 'logout',
      action: 'logout',
      ip: rawIp,
      path,
      blocked: true,
    },
  });
} catch {}

        return false;
      }

      res.setHeader('X-RateLimit-Limit', String(result.limit));
      res.setHeader(
        'X-RateLimit-Remaining',
        String(result.remaining),
      );
      res.setHeader('X-RateLimit-Reset', String(result.reset));

      return true;
    }
    // --------------------------------------------

    const rawIp = this.extractRealIp(req);
    const ipKey = this.normalizeIp(rawIp);

    const info: RateLimitConsumeResult & { blocked?: boolean } =
      await this.rlService.consume(action, ipKey);

    // 🔴 FIX: handle blocked explicitly
    if ((info as any).blocked) {
      res.setHeader('Retry-After', String(info.retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(info.limit));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(info.reset));

      this.logger.warn(
        `Rate limit blocked: action="${action}" key="${ipKey}" ip="${rawIp}" retryAfter=${info.retryAfterSec}`,
      );
     try {
  this.securityEvent.log({
    type: 'security.rate_limit.hit',
    severity: 'warning',
    meta: {
      scope: 'api',
      action,
      ip: rawIp,
      path,
      blocked: true,
    },
  });
} catch {}

      return false;
    }

    res.setHeader('X-RateLimit-Limit', String(info.limit));
    res.setHeader('X-RateLimit-Remaining', String(info.remaining));
    res.setHeader('X-RateLimit-Reset', String(info.reset));

    return true;
  }
}
