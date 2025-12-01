// file: sentry.edge.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  environment: process.env.NEXT_PUBLIC_SENTRY_ENV || "production",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // Edge Runtime ไม่ควรใช้ sampling สูง
  tracesSampleRate: 0.05,

  debug: false,

  beforeSend(event) {
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  },
});
