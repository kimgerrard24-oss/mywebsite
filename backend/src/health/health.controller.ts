// ==========================================
// file: backend/src/health/health.controller.ts
// ==========================================

import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
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

  // ==========================================
  // UPDATED: Use R2 instead of S3
  // ==========================================
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

  // ============================================================
  // OAuth/Firebase Login Environment Health Check
  // ============================================================
  @Get('oauth')
  oauthEnv() {
    return {
      ok: true,
      env: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID || null,
          redirectUrl: process.env.GOOGLE_REDIRECT_URL || null,
          callbackUrl: process.env.GOOGLE_CALLBACK_URL || null,
          providerRedirect:
            process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN || null,
        },
        facebook: {
          clientId: process.env.FACEBOOK_CLIENT_ID || null,
          redirectUrl: process.env.FACEBOOK_REDIRECT_URL || null,
          callbackUrl: process.env.FACEBOOK_CALLBACK_URL || null,
          providerRedirect:
            process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN || null,
        },
        firebase: {
          serviceAccountBase64: Boolean(
            process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
          ),
        },
        jwt: {
          jwtSecretLoaded: Boolean(process.env.JWT_SECRET),
          secretKeyLoaded: Boolean(process.env.SECRET_KEY),
        },
        cookie: {
          cookieDomain: process.env.COOKIE_DOMAIN || null,
        },
      },
    };
  }
}
