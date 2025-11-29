//files src/common/rate-limit/rate-limit.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(private readonly rlService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      'unknown';

    // ใช้ key แบบ auth + ip (เหมาะสำหรับ login/register)
    const key = `auth:${ip}`;

    try {
      // ใช้นโยบาย login จาก RateLimitPolicy
      await this.rlService.consume('login', key);
      return true;
    } catch {
      throw new ForbiddenException(
        'Too many authentication attempts. Try again later.',
      );
    }
  }
}
