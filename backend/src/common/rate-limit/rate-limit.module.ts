// src/common/rate-limit/rate-limit.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';

import { RateLimitService } from './rate-limit.service';
import { RateLimitGuard } from './rate-limit.guard';

/**
 * RateLimitModule
 *
 * - Provides RateLimitService
 * - Registers RateLimitGuard as a global guard (APP_GUARD)
 *
 * NOTE:
 * - This module expects a Redis client provider (token: 'REDIS_CLIENT')
 *   to be available in the application container. Do not add secrets here.
 */
@Module({
  providers: [
    RateLimitService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
  exports: [RateLimitService],
})
export class RateLimitModule {}
