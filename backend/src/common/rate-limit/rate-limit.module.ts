// src/common/rate-limit/rate-limit.module.ts

import { Global, Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';

import { RateLimitService } from './rate-limit.service';
import { RateLimitGuard } from './rate-limit.guard';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

@Global()
@Module({
  providers: [
    RateLimitService,
    Reflector,

    // -------------------------------
    // Auth rate-limit (มาก่อน)
    // -------------------------------
    {
      provide: APP_GUARD,
      useClass: AuthRateLimitGuard,
    },

    // -------------------------------
    // Action rate-limit (global)
    // -------------------------------
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],

  exports: [RateLimitService],
})
export class RateLimitModule {}
