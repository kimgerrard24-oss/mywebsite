// src/common/rate-limit/auth-rate-limit.guard.ts

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

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
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
      req.socket?.remoteAddress ||
      req.ip ||
      '';
    return String(ip).replace(/^::ffff:/, '');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const path = (req.path || '').toLowerCase();

    // Internal health
    const internal = req.headers['x-internal-health'];
    if (
      internal &&
      typeof internal === 'string' &&
      process.env.INTERNAL_HEALTH_TOKEN &&
      internal === process.env.INTERNAL_HEALTH_TOKEN
    ) {
      return true;
    }

    // Health bypass
    if (
      path === '/system-check' ||
      path === '/system-check/' ||
      path === '/health' ||
      path.startsWith('/health/') ||
      path.startsWith('/system-check/')
    ) {
      return true;
    }

    // Session-check bypass
    if (path.startsWith('/auth/session-check')) {
      return true;
    }

    // OAuth bypass
    if (
      path.startsWith('/auth/google') ||
      path.startsWith('/auth/facebook') ||
      path.startsWith('/auth/complete')
    ) {
      return true;
    }

    // IMPORTANT:
    // Local auth should be limited ONLY by action-level limit
    if (path.startsWith('/auth/local/login')) return true;
    if (path.startsWith('/auth/local/register')) return true;

    // Determine action
    const action =
      this.reflector.get<RateLimitAction>(
        RATE_LIMIT_CONTEXT_KEY,
        context.getHandler(),
      ) || null;

    if (!action) return true;

    const ip = this.extractRealIp(req);

    // Local auth = custom key (prevent mixing with other traffic)
    const key = `${action}:${ip}`;

    try {
      const info = await this.rlService.consume(action, key);

      res.setHeader('X-RateLimit-Limit', String(info.limit));
      res.setHeader('X-RateLimit-Remaining', String(info.remaining));
      res.setHeader('X-RateLimit-Reset', String(info.reset));

      return true;
    } catch (err: any) {
      const retry =
        typeof err?.retryAfterSec === 'number' ? err.retryAfterSec : 60;

      res.setHeader('Retry-After', retry);
      res.setHeader('X-RateLimit-Limit', err?.limit ?? 0);
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', retry);

      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests. Please slow down.',
      });
      return false;
    }
  }
}
