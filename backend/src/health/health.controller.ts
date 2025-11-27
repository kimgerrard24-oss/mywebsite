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
  // ไม่เปิดเผย environment จริง
  // แสดงเฉพาะว่าถูกตั้งค่าหรือไม่ตาม production standard
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

        jwtConfigured: Boolean(process.env.JWT_SECRET),

        cookieConfigured: Boolean(process.env.COOKIE_DOMAIN),
      },
    };
  }
}
