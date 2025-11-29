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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    // ---------------------------------------------------------
    // 1) Skip health-check (case-insensitive)
    // ---------------------------------------------------------
    const pathLower = (req.path || '').toLowerCase();
    if (
      pathLower === '/system-check' ||
      pathLower === '/system-check/' ||
      pathLower === '/health' ||
      pathLower.startsWith('/health/') ||
      pathLower.startsWith('/system-check/')
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // 2) Skip OAuth login flow (Google / Facebook)
    // ---------------------------------------------------------
    const oauthPaths = [
      '/auth/google',
      '/auth/google/callback',
      '/auth/facebook',
      '/auth/facebook/callback',
      '/auth/complete',
    ];

    for (const p of oauthPaths) {
      if (req.path.startsWith(p)) {
        return true;
      }
    }

    // ---------------------------------------------------------
    // 3) Remove whitelist IP logic (deleted)
    // ---------------------------------------------------------
    const xff = Array.isArray(req.headers['x-forwarded-for'])
      ? (req.headers['x-forwarded-for'][0] as string)
      : (req.headers['x-forwarded-for'] as string | undefined);

    const rawIp =
      (xff?.split(',')?.[0]?.trim()) ||
      (req.socket && (req.socket.remoteAddress as string | undefined)) ||
      (req.ip as string | undefined) ||
      '';

    const ip = String(rawIp).replace(/^::ffff:/, '');

    // ---------------------------------------------------------
    // 4) Read action metadata from decorator
    // If no action metadata -> skip
    // ---------------------------------------------------------
    const action =
      this.reflector.get<RateLimitAction>(
        RATE_LIMIT_CONTEXT_KEY,
        context.getHandler(),
      ) || null;

    if (!action) {
      return true;
    }

    // ---------------------------------------------------------
    // 5) Build key (prefer authenticated user id, fallback to ip)
    // ---------------------------------------------------------
    let userKey: string | null = null;
    try {
      userKey =
        (req as any).user?.id ||
        (req as any).user?.uid ||
        (req as any).auth?.uid ||
        null;
    } catch {
      userKey = null;
    }

    const key = userKey || ip || 'unknown';

    // ---------------------------------------------------------
    // 6) Perform rate-limit check via service
    // ---------------------------------------------------------
    try {
      const resLimit = await this.rlService.consume(action, key);

      res.setHeader('X-RateLimit-Limit', String(resLimit.limit));
      res.setHeader('X-RateLimit-Remaining', String(resLimit.remaining));
      res.setHeader('X-RateLimit-Reset', String(resLimit.reset));

      return true;
    } catch (err: any) {
      const retryAfterSec =
        typeof err?.retryAfterSec === 'number' ? err.retryAfterSec : 60;

      res.setHeader('Retry-After', String(retryAfterSec));
      res.setHeader('X-RateLimit-Limit', String(err?.limit ?? 0));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(retryAfterSec));

      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests. Please slow down.',
      });

      return false;
    }
  }
}
