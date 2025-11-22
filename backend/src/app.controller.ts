// ==========================================
// file: backend/src/app.controller.ts
// ==========================================

import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // Basic service check
  @Get('hello')
  getHello(): string {
    return 'PhlyPhant Backend: OK';
  }

  // Health Check including production important fields
  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      env: process.env.NODE_ENV || 'unknown',
      session_cookie_name: process.env.SESSION_COOKIE_NAME || 'session',
      cookie_domain: process.env.COOKIE_DOMAIN || 'not-set',
      google_oauth_callback: process.env.GOOGLE_CALLBACK_URL || 'missing',
      facebook_oauth_callback: process.env.FACEBOOK_CALLBACK_URL || 'missing',
      firebase_loaded: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      timestamp: new Date().toISOString(),
    };
  }

  // Sentry test
  @Get('debug-sentry')
  debugError() {
    throw new Error('Sentry test error triggered');
  }
}
