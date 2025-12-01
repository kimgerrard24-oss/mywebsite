// File: frontend/lib/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';


Sentry.init({
dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
environment: process.env.NODE_ENV || 'production',
release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,
tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1'),


integrations: [],
debug: false,


beforeSend(event) {
if (event.user) {
delete event.user.ip_address;
}
return event;
},
});