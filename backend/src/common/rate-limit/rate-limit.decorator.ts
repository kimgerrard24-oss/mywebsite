// src/common/rate-limit/rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RateLimitAction } from './rate-limit.policy';

// Metadata key used by RateLimitGuard / AuthRateLimitGuard
export const RATE_LIMIT_CONTEXT_KEY = 'RATE_LIMIT_CONTEXT';

// Explicit constant for ignoring rate-limit
export const RATE_LIMIT_IGNORE = 'IGNORE_RATE_LIMIT';

/**
 * RateLimitContext(action)
 * Example:
 *   @RateLimit('register')
 */
export const RateLimitContext = (action: RateLimitAction) =>
  SetMetadata(RATE_LIMIT_CONTEXT_KEY, action);

/**
 * Alias: @RateLimit('register')
 */
export const RateLimit = RateLimitContext;

/**
 * RateLimitIgnore()
 * Mark this endpoint to bypass all rate-limits
 *
 * Example:
 *   @RateLimitIgnore()
 *   @Get('health')
 */
export const RateLimitIgnore = () =>
  SetMetadata(RATE_LIMIT_CONTEXT_KEY, RATE_LIMIT_IGNORE);
