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

    // Global rate-limit guard สำหรับ @RateLimitContext
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },

    // AuthRateLimitGuard ใช้เฉพาะ login/register
    // ไม่ทำเป็น Global Guard
    AuthRateLimitGuard,
  ],

  exports: [
    RateLimitService,
    AuthRateLimitGuard,   // ให้ AuthModule ใช้ได้
  ],
})
export class RateLimitModule {}
