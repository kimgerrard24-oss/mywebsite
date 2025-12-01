// files src/sentry.ts
import * as Sentry from "@sentry/node";

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    environment: process.env.NODE_ENV || "production",
    release: process.env.SENTRY_RELEASE || undefined,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.05"),

    // ไม่มี profiling integration
    integrations: [],

    attachStacktrace: true,
    serverName: process.env.SERVICE_NAME || "backend-api",
  });
}
