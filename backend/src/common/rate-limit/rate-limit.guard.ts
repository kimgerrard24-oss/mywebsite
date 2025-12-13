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

    const method = req.method.toUpperCase();
    const path = (req.originalUrl || req.path || '').toLowerCase();

    // -------------------------------------------------------
    // ✅ HARD BYPASS — LOGIN MUST NEVER TOUCH RATE-LIMIT GUARD
    // -------------------------------------------------------
    if (
      method === 'POST' &&
      /\/auth\/local\/login(?:\/|$|\?)/.test(path)
    ) {
      return true;
    }

    // -------------------------------------------------------
    // Basic bypasses
    // -------------------------------------------------------
    if (method === 'OPTIONS' || method === 'HEAD') return true;
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

    if (path.startsWith('/auth/local/register')) return true;
    if (path.startsWith('/auth/local/refresh')) return true;

    const action = this.reflector.get<RateLimitAction>(
      RATE_LIMIT_CONTEXT_KEY,
      context.getHandler(),
    );

    if (!action) return true;

    // -------------------------------------------------------
    // Logout (custom handling)
    // -------------------------------------------------------
    if (
      method === 'POST' &&
      /\/auth\/local\/logout(?:\/|$)/.test(path)
    ) {
      const rawIp = this.extractRealIp(req);
      const ipKey = this.normalizeIp(rawIp);

      try {
        const info = await this.rlService.consume('logout', ipKey);

        res.setHeader('X-RateLimit-Limit', String(info.limit));
        res.setHeader('X-RateLimit-Remaining', String(info.remaining));
        res.setHeader('X-RateLimit-Reset', String(info.reset));
        return true;
      } catch (err: any) {
        const retry =
          typeof err?.retryAfterSec === 'number' ? err.retryAfterSec : 60;

        res.setHeader('Retry-After', String(retry));
        res.status(429).json({
          statusCode: 429,
          message: 'Too many requests. Please slow down.',
        });
        return false;
      }
    }

    // -------------------------------------------------------
    // Default rate-limit handling
    // -------------------------------------------------------
    const rawIp = this.extractRealIp(req);
    const ipKey = this.normalizeIp(rawIp);

    try {
      const info = await this.rlService.consume(action, ipKey);

      res.setHeader('X-RateLimit-Limit', String(info.limit));
      res.setHeader('X-RateLimit-Remaining', String(info.remaining));
      res.setHeader('X-RateLimit-Reset', String(info.reset));
      return true;
    } catch (err: any) {
      const retry =
        typeof err?.retryAfterSec === 'number' ? err.retryAfterSec : 60;

      res.setHeader('Retry-After', String(retry));
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests. Please slow down.',
      });
      return false;
    }
  }
}
