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

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(
    private readonly rlService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  private extractRealIp(req: Request): string {
    // Cloudflare
    if (req.headers['cf-connecting-ip']) {
      return String(req.headers['cf-connecting-ip']).split(',')[0].trim();
    }

    // Reverse proxy
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      return xff.split(',')[0].trim();
    }

    // Nginx / Traefik
    if (req.headers['x-real-ip']) {
      return String(req.headers['x-real-ip']).trim();
    }

    // Socket
    const ip =
      (req.socket && req.socket.remoteAddress) ||
      req.ip ||
      '';

    return String(ip).trim();
  }

  private normalizeIp(ip: string): string {
    if (!ip) return 'unknown';

    let s = String(ip).trim();

    // IPv6 mapped
    s = s.replace(/^::ffff:/, '');

    // remove port if present
    s = s.replace(/:\d+$/, '');

    // safe normalize
    s = s.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (!s || s.length === 0) {
      return 'unknown';
    }

    return s;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    let path = (req.path || '').toLowerCase();

    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }

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

    if (path.startsWith('/auth/session-check')) {
      return true;
    }

    if (
      path.startsWith('/auth/google') ||
      path.startsWith('/auth/facebook') ||
      path.startsWith('/auth/complete')
    ) {
      return true;
    }

    const isLoginPath =
      path === '/login' ||
      path === '/auth/local/login';

    if (isLoginPath && req.method.toUpperCase() === 'POST') {
      return true;
    }

    if (path.startsWith('/auth/local/register')) return true;
    if (path.startsWith('/auth/local/refresh')) return true;

    const action =
      this.reflector.get<RateLimitAction>(
        RATE_LIMIT_CONTEXT_KEY,
        context.getHandler(),
      ) || null;

    if (!action) return true;

    const rawIp = this.extractRealIp(req);
    const normalizedIp = this.normalizeIp(rawIp);
    const key = `${action}_${normalizedIp}`;

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
