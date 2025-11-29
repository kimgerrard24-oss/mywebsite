// src/common/rate-limit/rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RateLimitAction } from './rate-limit.policy';

/**
 * Metadata key for attaching rate-limit policy
 * to specific controller methods.
 */
export const RATE_LIMIT_KEY = 'rateLimitContext';

/**
 * Decorator used like:
 *   @RateLimitContext('login')
 *   @RateLimitContext('postCreate')
 *
 * It stores the RateLimitAction on the route handler metadata,
 * which is read by the global RateLimitGuard via Reflector.
 */
export const RateLimitContext = (action: RateLimitAction) =>
  SetMetadata(RATE_LIMIT_KEY, action);
