// src/common/rate-limit/rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { RateLimitAction } from './rate-limit.policy';

// Metadata key ที่ guard ใช้อ่าน action
export const RATE_LIMIT_CONTEXT_KEY = 'RATE_LIMIT_CONTEXT';

/**
 * RateLimitContext(action)
 * ใช้กำหนด action ให้ RateLimitGuard รู้ว่าต้องใช้ policy ใด
 */
export const RateLimitContext = (action: RateLimitAction) =>
  SetMetadata(RATE_LIMIT_CONTEXT_KEY, action);

/**
 * Alias ที่ใช้จริงใน Controller
 * เช่น: @RateLimit('register')
 */
export const RateLimit = RateLimitContext;

/**
 * RateLimitIgnore()
 * ใช้เพื่อบอก Guard ว่า endpoint นี้ "ไม่ต้องตรวจ rate-limit"
 *
 * เช่น:
 *   @RateLimitIgnore()
 *   @Get('health')
 */
export const RateLimitIgnore = () =>
  SetMetadata(RATE_LIMIT_CONTEXT_KEY, null);
