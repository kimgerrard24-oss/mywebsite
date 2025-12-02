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
    // 0) Skip INTERNAL HEALTH CHECK (ถ้ามี token ตรง)
    // ---------------------------------------------------------
    const internalToken = req.headers['x-internal-health'];
    if (
      internalToken &&
      typeof internalToken === 'string' &&
      process.env.INTERNAL_HEALTH_TOKEN &&
      internalToken === process.env.INTERNAL_HEALTH_TOKEN
    ) {
      return true;
    }

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
    // 2) Skip session-check (สำคัญมากสำหรับ social login)
    // ---------------------------------------------------------
    if (path === '/auth/session-check' || path.startsWith('/auth/session-check')) {
      return true;
    }

    // ---------------------------------------------------------
    // 3) Whitelist OAuth login + callback + complete
    // ---------------------------------------------------------
    const oauthExact = new Set([
      '/auth/local/google',
      '/auth/local/google/callback',
      '/auth/local/facebook',
      '/auth/local/facebook/callback',
      '/auth/local/complete',
    ]);

    if (oauthExact.has(path)) {
      return true;
    }

    if (
      path.startsWith('/auth/local/google/callback') ||
      path.startsWith('/auth/local/facebook/callback') ||
      path.startsWith('/auth/local/google') ||
      path.startsWith('/auth/local/facebook') ||
      path.startsWith('/auth/local/complete')
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // 4) Extract IP
    // ---------------------------------------------------------
    const xff = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'];

    const rawIp =
      (xff?.split(',')?.[0]?.trim()) ||
      (req.socket?.remoteAddress as string | undefined) ||
      (req.ip as string | undefined) ||
      '';

    const ip = String(rawIp).replace(/^::ffff:/, '');

    // ---------------------------------------------------------
    // 5) Determine rate-limit action
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
    // 6) Build key (prefer userId)
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
    // 7) Consume rate-limit
    // ---------------------------------------------------------
    try {
      const info = await this.rlService.consume(action, key);

      res.setHeader('X-RateLimit-Limit', String(info.limit));
      res.setHeader('X-RateLimit-Remaining', String(info.remaining));
      res.setHeader('X-RateLimit-Reset', String(info.reset));

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
