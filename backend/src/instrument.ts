// instrument.ts — เรียกใช้ Sentry ให้เริ่มทำงานก่อน NestJS ทั้งหมด
// ใช้ได้กับ Sentry SDK v8+

import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENV || 'development',
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.3'), // 30% tracing
  profilesSampleRate: 1.0, // เก็บ CPU/Performance profiling
  sendDefaultPii: true, // เก็บข้อมูล IP ของ request (จำเป็นต่อ security/debugging)
});
