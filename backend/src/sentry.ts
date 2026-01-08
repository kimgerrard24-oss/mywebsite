// file: src/sentry.ts
import * as Sentry from '@sentry/node';

export function initSentry() {
  // DO NOT call Sentry.init() here

  // example: set global tags / context
  Sentry.setTag('service', process.env.SERVICE_NAME || 'backend-api');

  if (process.env.NODE_ENV) {
    Sentry.setTag('env', process.env.NODE_ENV);
  }
}
