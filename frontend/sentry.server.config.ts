// File: frontend/lib/sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';


Sentry.init({
dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
environment: process.env.NODE_ENV || 'production',
release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,
tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1'),


integrations: [],
debug: false,


beforeSend(event) {
if (event.request) {
delete event.request.headers;
delete event.request.cookies;
delete event.request.data;
}
return event;
},
});