// src/auth/guards/rate-limit.guard.ts

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

import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

// -----------------------------------------------------------
// Brute-force protection for login attempts
// (Added as requested, without modifying existing logic)
// -----------------------------------------------------------

const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const maxWrongAttemptsByIPperMinute =
  Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 10;

const blockDuration =
  Number(process.env.RATE_LIMIT_BLOCK_SECONDS) || 60 * 15; // default 15 min

const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: maxWrongAttemptsByIPperMinute,
  duration: 60, // 1 minute
  blockDuration, // block time after limit exceeded
  keyPrefix: 'rl_login',
});

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

  // Extract real IP
  private extractRealIp(req: Request): string {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string') {
      return xff.split(',')[0].trim().replace(/^::ffff:/, '');
    }
    const ip =
      req.socket?.remoteAddress ||
      req.ip ||
      '';
    return String(ip).replace(/^::ffff:/, '');
  }

  // -----------------------------------------------------------
  // NEW: revokeIp() helper, used after successful login
  // -----------------------------------------------------------
  static async revokeIp(ip: string) {
    try {
      await loginLimiter.delete(`ip:${ip}`);
    } catch (err) {
      // ignore
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const path = (req.path || '').toLowerCase();

    // Health checks bypass
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
      path === '/system-check/' ||
      path === '/health' ||
      path.startsWith('/health/') ||
      path.startsWith('/system-check/')
    ) {
      return true;
    }

    // OAuth bypass
    if (
      path.startsWith('/auth/google') ||
      path.startsWith('/auth/facebook') ||
      path.startsWith('/auth/complete')
    ) {
      return true;
    }

    if (path.startsWith('/auth/session-check')) {
      return true;
    }

    // -----------------------------------------------------------
    // NEW: apply brute-force limiter for /auth/local/login only
    // -----------------------------------------------------------
    if (path.startsWith('/auth/local/login')) {
      const ip = this.extractRealIp(req);
      const key = `ip:${ip}`;
      try {
        await loginLimiter.consume(key, 1);
        // continue to main logic
      } catch (err: any) {
      const retryAfter =
    typeof err?.msBeforeNext === 'number'
      ? Math.ceil(err.msBeforeNext / 1000)
      : 60;

  res.setHeader('Retry-After', retryAfter);

  this.logger.warn(
    `Login brute-force blocked: ip="${ip}" retryAfter=${retryAfter}`,
  );

  res.status(429).json({
    statusCode: 429,
    message: 'Too many login attempts. Try again later.',
  });

  return false;
}

      return true; // allow login to authService.validateUser()
    }

    // Allow registration / refresh token
    if (path.startsWith('/auth/local/register')) return true;
    if (path.startsWith('/auth/local/refresh')) return true;

    // -----------------------------------------------------------
    // Existing RateLimitService action-level rate limiting logic
    // -----------------------------------------------------------
    const action = this.reflector.get<RateLimitAction>(
      RATE_LIMIT_CONTEXT_KEY,
      context.getHandler(),
    );

    if (!action) return true;

    const ip = this.extractRealIp(req);
    const key = `ip:${ip}`;

    try {
      const info: RateLimitConsumeResult = await this.rlService.consume(
        action,
        key,
      );

      res.setHeader('X-RateLimit-Limit', info.limit);
      res.setHeader('X-RateLimit-Remaining', info.remaining);
      res.setHeader('X-RateLimit-Reset', info.reset);
      return true;
    } catch (err: any) {
      const retry =
        typeof err?.retryAfterSec === 'number' ? err.retryAfterSec : 60;

      res.setHeader('Retry-After', retry);
      res.setHeader('X-RateLimit-Limit', err?.limit ?? 0);
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', retry);

      this.logger.warn(
        `Rate limit blocked: action="${action}" key="${key}" ip="${ip}" retryAfter=${retry}`,
      );

      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests. Please slow down.',
      });

      return false;
    }
  }
}
