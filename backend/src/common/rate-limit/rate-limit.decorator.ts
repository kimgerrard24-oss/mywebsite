// src/common/rate-limit/rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RateLimitAction } from './rate-limit.policy';

// Metadata key used by RateLimitGuard / AuthRateLimitGuard
export const RATE_LIMIT_CONTEXT_KEY = 'RATE_LIMIT_CONTEXT';

// Explicit constant for ignoring rate-limit in controllers
export const RATE_LIMIT_IGNORE = 'IGNORE_RATE_LIMIT';

/**
 * RateLimitContext(action)
 * Assign a rate-limit policy to specific handler.
 *
 * Example:
 *   @RateLimit('register')
 */
export const RateLimitContext = (action: RateLimitAction) =>
  SetMetadata(RATE_LIMIT_CONTEXT_KEY, action);

/**
 * Alias decorator for convenience
 */
export const RateLimit = RateLimitContext;

/**
 * RateLimitIgnore()
 * Mark this route to bypass action-level rate limit checks.
 *
 * NOTE:
 * Brute-force login limiter (RateLimitGuard loginLimiter)
 * will still apply unless explicitly bypassed inside guard.
 */
export const RateLimitIgnore = () =>
  SetMetadata(RATE_LIMIT_CONTEXT_KEY, RATE_LIMIT_IGNORE);
