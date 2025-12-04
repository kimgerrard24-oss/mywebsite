// files src/common/rate-limit/rate-limit-guard.ts
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

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(times * 200, 30000);
  },
  reconnectOnError(err) {
    const target = ['READONLY', 'ECONNRESET', 'ECONNREFUSED'];
    return target.some((m) => err.message.includes(m));
  },
});

const maxWrongAttemptsByIPperMinute =
  Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 10;

const blockDuration =
  Number(process.env.RATE_LIMIT_BLOCK_SECONDS) || 60 * 15;

const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: maxWrongAttemptsByIPperMinute,
  duration: 60,
  blockDuration,
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

    // remove port (e.g. :54129)
    s = s.replace(/:\d+$/, '');

    // remove unsafe chars
    s = s.replace(/[^a-zA-Z0-9_-]/g, '_');

    return s;
  }

  static async revokeIp(ip: string) {
    try {
      const key = String(ip || '')
        .trim()
        .replace(/^::ffff:/, '')
        .replace(/:\d+$/, '') // remove port
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      await loginLimiter.delete(key);
    } catch (err) {}
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    // Normalize path (remove trailing slash)
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

    // LOGIN limiter (STRICT match)
    const isLoginPath =
      path === '/login' ||
      path === '/auth/local/login';

    if (isLoginPath && req.method && req.method.toUpperCase() === 'POST') {
      const rawIp = this.extractRealIp(req);
      const normalizedIp = this.normalizeKey(rawIp);
      const key = normalizedIp;

      try {
        await loginLimiter.consume(key, 1);
        return true;
      } catch (err: any) {
        const retryAfter =
          typeof err?.msBeforeNext === 'number'
            ? Math.ceil(err.msBeforeNext / 1000)
            : typeof err?.msBeforeNext === 'string'
            ? Math.ceil(Number(err.msBeforeNext) / 1000)
            : Math.ceil((blockDuration || 60 * 15));

        res.setHeader('Retry-After', String(retryAfter));
        res.setHeader('X-RateLimit-Limit', String(maxWrongAttemptsByIPperMinute));
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', String(retryAfter));

        this.logger.warn(
          `Login brute-force blocked: ip="${rawIp}" normalized="${normalizedIp}" retryAfter=${retryAfter}`,
        );

        res.status(429).json({
          statusCode: 429,
          message: 'Too many login attempts. Try again later.',
        });

        return false;
      }
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
