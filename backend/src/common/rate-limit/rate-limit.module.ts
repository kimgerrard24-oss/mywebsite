// src/common/rate-limit/rate-limit.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';

import { RateLimitService } from './rate-limit.service';
import { RateLimitGuard } from './rate-limit.guard';


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
