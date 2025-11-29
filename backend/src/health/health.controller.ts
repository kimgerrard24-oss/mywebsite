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
  info() {
    return this.health.systemInfo();
  }

  @Get('backend')
  backend() {
    return this.health.apiCheck();
  }

  @Get('db')
  db() {
    return this.health.dbCheck();
  }

  @Get('redis')
  redis() {
    return this.health.redisCheck();
  }

  @Get('secrets')
  secrets() {
    return this.health.secretsCheck();
  }

  @Get('r2')
  r2() {
    return this.health.r2Check();
  }

  @Get('queue')
  queue() {
    return this.health.queueCheck();
  }

  @Get('socket')
  socket() {
    return this.health.socketCheck();
  }

  // ==========================================
  // FIXED: OAuth/Firebase Health Check
  // ==========================================
  @Get('oauth')
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
