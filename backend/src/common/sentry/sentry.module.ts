import { Global, Module, Provider } from '@nestjs/common';
import * as Sentry from '@sentry/node';


const SENTRY_PROVIDER = 'SENTRY_PROVIDER';


const SentryProvider: Provider = {
  provide: SENTRY_PROVIDER,
  useFactory: () => {
    Sentry.init({
      dsn: process.env.SENTRY_DSN || '',
      environment: process.env.NODE_ENV || 'production',
      release: process.env.SENTRY_RELEASE || undefined,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.05'),
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