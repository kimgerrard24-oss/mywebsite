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

    // AuthRateLimitGuard ต้องทำงานก่อน RateLimitGuard
    {
      provide: APP_GUARD,
      useClass: AuthRateLimitGuard,
    },

    // Global rate-limit guard สำหรับ @RateLimitContext
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],

  exports: [
    RateLimitService,
  ],
})
export class RateLimitModule {}
