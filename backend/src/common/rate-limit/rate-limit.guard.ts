// src/common/rate-limit/rate-limit.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RateLimitService } from './rate-limit.service';
import { RATE_LIMIT_KEY } from './rate-limit.decorator';
import { RateLimitAction } from './rate-limit.policy';


@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rlService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action =
      this.reflector.get<RateLimitAction>(RATE_LIMIT_KEY, context.getHandler()) ||
      'ip';

    const req = context.switchToHttp().getRequest<Request>();

    // Try common ways to get client IP (behind proxies)
    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      'unknown';

    // Prefer an authenticated user's id if available (session, jwt, firebase user, etc.)
    let userId: string | null = null;
    try {
      // Common placements: req.user, req.auth, or specific frameworks may attach uid
      userId =
        (req as any).user?.id ||
        (req as any).user?.uid ||
        (req as any).auth?.uid ||
        null;
    } catch {
      userId = null;
    }

    const key = userId || ip;

    try {
      await this.rlService.consume(action, key);
      return true;
    } catch (err) {
      // Log useful info for monitoring/alerts without leaking secrets
      this.logger.warn(
        `Rate limit blocked: action="${action}" key="${key}" ip="${ip}"`,
      );

      throw new ForbiddenException(
        'Too many requests — please try again later.',
      );
    }
  }
}
