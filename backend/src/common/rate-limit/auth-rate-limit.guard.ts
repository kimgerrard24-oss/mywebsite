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

    const rawPath = req.path || '';
    const path = rawPath.toLowerCase();

    // ---------------------------------------------------------
    // 1) Skip health-check
    // ---------------------------------------------------------
    if (
      path === '/system-check' ||
      path === '/system-check/' ||
      path === '/health' ||
      path.startsWith('/health/') ||
      path.startsWith('/system-check/')
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // 2) Whitelist OAuth login + callback + complete
    // ---------------------------------------------------------
    const oauthExact = new Set([
      '/auth/google',
      '/auth/google/callback',
      '/auth/facebook',
      '/auth/facebook/callback',
      '/auth/complete',
    ]);

    if (oauthExact.has(path)) {
      return true;
    }

    // รองรับกรณีมี query string (callback / complete)
    if (
      path.startsWith('/auth/google/callback') ||
      path.startsWith('/auth/facebook/callback') ||
      path.startsWith('/auth/google') ||
      path.startsWith('/auth/facebook') ||
      path.startsWith('/auth/complete')
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // 3) IP extraction
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
    // 4) Read rate-limit action
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
    // 5) Build key (prefer userKey if exists)
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
    // 6) Perform rate-limit check
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
