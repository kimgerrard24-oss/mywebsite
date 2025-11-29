// src/common/rate-limit/rate-limit.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
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
    // -----------------------------------------
    // 1) อ่าน metadata จาก decorator
    // ถ้าไม่ได้กำหนด -> ไม่ทำ rate-limit ตรงนี้
    // -----------------------------------------
    const action =
      this.reflector.get<RateLimitAction>(
        RATE_LIMIT_CONTEXT_KEY,
        context.getHandler(),
      ) || null;

    if (!action) {
      return true;
    }

    // -----------------------------------------
    // 2) ดึงข้อมูล request + IP
    // -----------------------------------------
    const req = context.switchToHttp().getRequest<Request>();

    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      'unknown';

    // -----------------------------------------
    // 3) ถ้ามี user -> ใช้ user.id แทน IP (ปลอดภัยกว่า)
    // -----------------------------------------
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

    // -----------------------------------------
    // 4) ใช้ RateLimitService ตรวจนับ policy
    // -----------------------------------------
    try {
      await this.rlService.consume(action, key);
      return true;
    } catch {
      throw new ForbiddenException(
        'Too many authentication attempts. Try again later.',
      );
    }
  }
}
