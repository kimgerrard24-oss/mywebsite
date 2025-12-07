// file: src/common/sentry.module.ts

import { Global, Module, Provider } from '@nestjs/common';
import * as Sentry from '@sentry/node';

const SENTRY_PROVIDER = 'SENTRY_PROVIDER';

const SentryProvider: Provider = {
  provide: SENTRY_PROVIDER,
  useFactory: () => {
    const dsn = process.env.SENTRY_DSN;

    // =======================================
    // Disable Sentry when DSN missing
    // Avoid background traffic causing 429
    // =======================================
    if (!dsn || dsn.trim().length === 0) {
      console.warn('[Sentry] Disabled - missing SENTRY_DSN');
      return Sentry;
    }

    // =======================================
    // Safe initialization
    // =======================================
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'production',
      release: process.env.SENTRY_RELEASE || undefined,

      // Reduce sample rates to avoid quota limits
      tracesSampleRate: parseFloat(
        process.env.SENTRY_TRACES_SAMPLE_RATE || '0.01'
      ),

      // Basic HTTP integration only
      integrations: [
        Sentry.httpIntegration(),
      ],

      attachStacktrace: true,
      serverName: process.env.SERVICE_NAME || 'backend-api',
    });

    return Sentry;
  },
};

@Global()
@Module({
  providers: [SentryProvider],
  exports: [SentryProvider],
})
export class SentryModule {}
