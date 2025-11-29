// ==========================================
// file: backend/src/health/health.controller.ts
// ==========================================

import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

// NEW: Skip rate-limit for all health endpoints
import { RateLimitIgnore } from '../common/rate-limit/rate-limit.decorator';

@Controller('health')
@RateLimitIgnore() // Apply to the whole controller
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('info')
  @RateLimitIgnore()
  info() {
    return this.health.systemInfo();
  }

  @Get('backend')
  @RateLimitIgnore()
  backend() {
    return this.health.apiCheck();
  }

  @Get('db')
  @RateLimitIgnore()
  db() {
    return this.health.dbCheck();
  }

  @Get('redis')
  @RateLimitIgnore()
  redis() {
    return this.health.redisCheck();
  }

  @Get('secrets')
  @RateLimitIgnore()
  secrets() {
    return this.health.secretsCheck();
  }

  @Get('r2')
  @RateLimitIgnore()
  r2() {
    return this.health.r2Check();
  }

  @Get('queue')
  @RateLimitIgnore()
  queue() {
    return this.health.queueCheck();
  }

  @Get('socket')
  @RateLimitIgnore()
  socket() {
    return this.health.socketCheck();
  }

  @Get('oauth')
  @RateLimitIgnore()
  oauthEnv() {
    return {
      ok: true,
      env: {
        googleConfigured:
          Boolean(process.env.GOOGLE_CLIENT_ID) &&
          Boolean(process.env.GOOGLE_CLIENT_SECRET),

        facebookConfigured:
          Boolean(process.env.FACEBOOK_CLIENT_ID) &&
          Boolean(process.env.FACEBOOK_CLIENT_SECRET),

        firebaseConfigured: Boolean(
          process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        ),

        cookieConfigured: Boolean(process.env.COOKIE_DOMAIN),
      },
    };
  }
}
