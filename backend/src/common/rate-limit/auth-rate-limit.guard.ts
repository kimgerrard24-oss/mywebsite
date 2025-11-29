// src/common/rate-limit/rate-limit.guard.ts

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
    // 1) Skip health-check (สำคัญที่สุด)
    // ---------------------------------------------------------
    const pathLower = req.path.toLowerCase();
    if (pathLower.startsWith('/health') || pathLower.startsWith('/system-check')) {
      return true;
    }

    // ---------------------------------------------------------
    // 2) อ่าน metadata action จาก decorator
    // ถ้าไม่มี -> ไม่ทำ rate-limit
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
    // 3) ดึง IP และ userKey
    // ---------------------------------------------------------
    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      'unknown';

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

    const key = userKey || ip;

    // ---------------------------------------------------------
    // 4) ตรวจ rate-limit ผ่าน Service
    // ---------------------------------------------------------
    try {
      const resLimit = await this.rlService.consume(action, key);

      // Header สำหรับมาตรฐาน Rate-Limit (RFC-compliant)
      res.setHeader('X-RateLimit-Limit', String(resLimit.limit));
      res.setHeader('X-RateLimit-Remaining', String(resLimit.remaining));
      res.setHeader('X-RateLimit-Reset', String(resLimit.reset));

      return true;
    } catch (err: any) {
      const retryAfterSec =
        typeof err?.retryAfterSec === 'number' ? err.retryAfterSec : 60;

      // -------------------------------------------------------
      // 429 มาตรฐานของ Rate Limit
      // -------------------------------------------------------
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
