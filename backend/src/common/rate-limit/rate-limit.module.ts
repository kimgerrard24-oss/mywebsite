// src/common/rate-limit/rate-limit.module.ts

import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { RateLimitService } from './rate-limit.service';
import { RateLimitGuard } from './rate-limit.guard';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

@Module({
  providers: [
    RateLimitService,
    Reflector,

    /**
     * IMPORTANT ORDER FIX
     *
     * 1) AuthRateLimitGuard should run FIRST
     *    - It bypasses login/register/refresh for action-level rate-limit
     *    - Prevents false blocking during login
     *
     * 2) RateLimitGuard should run SECOND
     *    - It contains brute-force protection for /auth/local/login
     *    - It should not override AuthRateLimitGuard behavior
     */
    {
      provide: APP_GUARD,
      useClass: AuthRateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],

  exports: [RateLimitService],
})
export class RateLimitModule {}
