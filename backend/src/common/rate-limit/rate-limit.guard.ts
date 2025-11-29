// src/common/rate-limit/rate-limit.guard.ts
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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const path = req.path;
    const pathLower = path.toLowerCase();

    // ============================================================
    // 0) INTERNAL HEALTH TOKEN (ปลอดภัยที่สุด)
    // ============================================================
    const internalToken = req.headers['x-internal-health'];
    if (
      internalToken &&
      typeof internalToken === 'string' &&
      process.env.INTERNAL_HEALTH_TOKEN &&
      internalToken === process.env.INTERNAL_HEALTH_TOKEN
    ) {
      return true;
    }

    // ============================================================
    // 1) Skip health-check endpoints
    // ============================================================
    if (
      pathLower === '/system-check' ||
      pathLower === '/system-check/' ||
      pathLower === '/health' ||
      pathLower.startsWith('/health/') ||
      pathLower.startsWith('/system-check/')
    ) {
      return true;
    }

    // ============================================================
    // 2) Skip OAuth login paths (Google / Facebook)
    // ============================================================
    const oauthPaths = [
      '/auth/google',
      '/auth/google/callback',
      '/auth/facebook',
      '/auth/facebook/callback',
      '/auth/complete',
    ];

    for (const p of oauthPaths) {
      if (path.startsWith(p)) {
        return true;
      }
    }

    // ============================================================
    // 3) (REMOVED) Internal Docker network IP whitelist
    // ============================================================
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      '';

    const ip = rawIp.replace('::ffff:', '');

    // ============================================================
    // 4) Select rate-limit action
    // ============================================================
    const action =
      this.reflector.get<RateLimitAction>(
        RATE_LIMIT_CONTEXT_KEY,
        context.getHandler(),
      ) || 'ip';

    // ============================================================
    // 5) Prepare rate-limit key (user or IP)
    // ============================================================
    let userId: string | null = null;

    try {
      userId =
        (req as any).user?.id ||
        (req as any).user?.uid ||
        (req as any).auth?.uid ||
        null;
    } catch {
      userId = null;
    }

    const key = userId ? `user:${userId}` : `ip:${ip}`;

    // ============================================================
    // 6) Execute rate-limit
    // ============================================================
    try {
      const result: RateLimitConsumeResult = await this.rlService.consume(
        action,
        key,
      );

      res.setHeader('X-RateLimit-Limit', String(result.limit));
      res.setHeader('X-RateLimit-Remaining', String(result.remaining));
      res.setHeader('X-RateLimit-Reset', String(result.reset));

      return true;
    } catch (err: any) {
      const retryAfterSec =
        typeof err?.retryAfterSec === 'number' ? err.retryAfterSec : 60;

      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Reset', String(retryAfterSec));

      const limit =
        typeof err?.limit === 'number' ? err.limit : undefined;

      if (limit !== undefined) {
        res.setHeader('X-RateLimit-Limit', String(limit));
        res.setHeader('X-RateLimit-Remaining', '0');
      }

      this.logger.warn(
        `Rate limit blocked: action="${action}" key="${key}" ip="${ip}" retryAfter=${retryAfterSec}`,
      );

      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests. Please slow down.',
      });

      return false;
    }
  }
}
