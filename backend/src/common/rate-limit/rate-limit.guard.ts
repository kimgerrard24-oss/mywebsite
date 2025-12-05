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

  private normalizeKey(ip: string): string {
    if (!ip) return 'unknown';
    let s = String(ip).trim().replace(/^::ffff:/, '');
    s = s.replace(/:\d+$/, '');
    s = s.replace(/[^a-zA-Z0-9_-]/g, '_');
    return s;
  }

  /**
   * NEW: Remove rate-limit block after successful login
   */
  static async revokeIp(ip: string) {
    try {
      const clean = String(ip || '')
        .trim()
        .replace(/^::ffff:/, '')
        .replace(/:\d+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');

      const redis = require('ioredis');
      const client = new redis(process.env.REDIS_URL);

      // Remove all possible key formats
      await client.del(`rl:login:${clean}`);
      await client.del(`login:${clean}`);
      await client.del(`rl_login:${clean}`);

      client.disconnect();
    } catch (err) {
      // fail silently, never block login
    }
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

    if (
      path.startsWith('/auth/google') ||
      path.startsWith('/auth/facebook') ||
      path.startsWith('/auth/complete') ||
      path.startsWith('/auth/session-check')
    ) {
      return true;
    }

    const isLoginPath =
      path === '/login' ||
      path === '/auth/local/login';

    if (isLoginPath && req.method && req.method.toUpperCase() === 'POST') {
      return true;
    }

    if (path.startsWith('/auth/local/register')) return true;
    if (path.startsWith('/auth/local/refresh')) return true;

    const action = this.reflector.get<RateLimitAction>(
      RATE_LIMIT_CONTEXT_KEY,
      context.getHandler(),
    );

    if (!action) return true;

    const rawIp = this.extractRealIp(req);
    const normalizedIp = this.normalizeKey(rawIp);
    const actionKey = `${action}:${normalizedIp}`;

    try {
      const info: RateLimitConsumeResult = await this.rlService.consume(
        action,
        actionKey,
      );

      res.setHeader('X-RateLimit-Limit', String(info.limit));
      res.setHeader('X-RateLimit-Remaining', String(info.remaining));
      res.setHeader('X-RateLimit-Reset', String(info.reset));
      return true;
    } catch (err: any) {
      const retry =
        typeof err?.retryAfterSec === 'number' ? err.retryAfterSec : 60;

      res.setHeader('Retry-After', String(retry));
      res.setHeader('X-RateLimit-Limit', err?.limit ?? 0);
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(retry));

      this.logger.warn(
        `Rate limit blocked: action="${action}" key="${actionKey}" ip="${rawIp}" retryAfter=${retry}`,
      );

      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests. Please slow down.',
      });

      return false;
    }
  }
}
