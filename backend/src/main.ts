// file: src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { Express } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import './instrument';
import * as Sentry from '@sentry/node';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SentryInterceptor } from './sentry.interceptor';
import helmet from 'helmet';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { FirebaseAdminService } from './firebase/firebase.service';
import type { Request, Response } from 'express';
import { initSentry } from './sentry';
import { RedisIoAdapter } from './socket/redis-io.adapter';

const logger = new Logger('bootstrap');

function getRedisUrl(): string {
  const url = process.env.REDIS_URL;
  if (!url || url.trim() === '') {
    throw new Error('REDIS_URL is missing. Please check backend/.env.production');
  }
  return url;
}

function redisOptions() {
  return {
    enableReadyCheck: true,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      return Math.min(times * 100, 2000);
    },
  } as any;
}

function normalizeToOrigin(raw: string | undefined): string {
  if (!raw) return '';
  try {
    const trimmed = raw.trim();
    const u = new URL(trimmed);
    return u.origin;
  } catch {
    let s = String(raw).trim();
    s = s.replace(/\/auth\/?complete\/?$/i, '');
    s = s.replace(/\/+$/g, '');
    return s;
  }
}

async function bootstrap(): Promise<void> {
  // Initialize Sentry (server-side)
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'production',
    release: process.env.SENTRY_RELEASE || undefined,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.05'),
    integrations: [Sentry.httpIntegration()],
    // Do not capture PII by default here; we'll add user context explicitly in filters/interceptors
    attachStacktrace: true,
    serverName: process.env.SERVICE_NAME || 'backend-api',
  });

  initSentry();

  const nestApp = await NestFactory.create(AppModule, {
    cors: false,
  });

  const expressApp = nestApp.getHttpAdapter().getInstance() as Express;

  expressApp.set('trust proxy', true);

 expressApp.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],

        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],

        imgSrc: [
          "'self'",
          "data:",
          "https://*.r2.dev",
          process.env.R2_PUBLIC_BASE_URL!,
        ],

        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https:"],
        frameAncestors: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

  expressApp.use(cookieParser());

  const corsRegex = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https?:\/\/([a-zA-Z0-9-]+\.)*phlyphant\.com(:\d+)?$/,
    /^https?:\/\/([a-zA-Z0-9-]+\.)*mywebsite\.com(:\d+)?$/,
  ];

  expressApp.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const ok = corsRegex.some((r) => r.test(origin));
        return ok ? callback(null, true) : callback(new Error('CORS blocked by server'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-Requested-With',
        'Origin',
        'Accept',
        'Cache-Control',
        'Pragma',
        'Expires',
        'Cookie',
      ],
      exposedHeaders: ['Set-Cookie'],
      optionsSuccessStatus: 204,
    }),
  );

  expressApp.use((req: Request, res: Response, next) => {
    const origin = req.headers.origin as string | undefined;
    if (!origin) return next();
    const ok = corsRegex.some((r) => r.test(origin));
    if (ok) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
      const prevVary = res.getHeader('Vary');
      if (!prevVary) {
        res.setHeader('Vary', 'Origin');
      } else if (typeof prevVary === 'string' && !prevVary.includes('Origin')) {
        res.setHeader('Vary', `${prevVary}, Origin`);
      }
    }
    return next();
  });

  try {
    const googleProviderRedirect =
      process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN || '';
    const facebookProviderRedirect =
      process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN || '';
    const cookieDomain = process.env.COOKIE_DOMAIN || '';
    const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'session';

    const normalizedGoogleOrigin = normalizeToOrigin(googleProviderRedirect);
    const normalizedFacebookOrigin = normalizeToOrigin(facebookProviderRedirect);

    logger.log(`Startup check: COOKIE_DOMAIN=${cookieDomain || '<not set>'}`);
    logger.log(`Startup check: SESSION_COOKIE_NAME=${sessionCookieName}`);
    logger.log(
      `Startup check: GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN (raw)=${
        googleProviderRedirect ? '<set>' : '<not set>'
      }`,
    );
    if (googleProviderRedirect) {
      logger.log(
        `Startup check: GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN (origin)=${
          normalizedGoogleOrigin || '<invalid URL>'
        }`,
      );
    }
    logger.log(
      `Startup check: FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN (raw)=${
        facebookProviderRedirect ? '<set>' : '<not set>'
      }`,
    );
    if (facebookProviderRedirect) {
      logger.log(
        `Startup check: FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN (origin)=${
          normalizedFacebookOrigin || '<invalid URL>'
        }`,
      );
    }

    if (/(\/auth\/?complete)/i.test(googleProviderRedirect)) {
      logger.warn(
        'GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN contains path like /auth/complete — this may cause duplicated redirects',
      );
    }
    if (/(\/auth\/?complete)/i.test(facebookProviderRedirect)) {
      logger.warn(
        'FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN contains path like /auth/complete — this may cause duplicated redirects',
      );
    }
  } catch (e) {
    logger.warn('Startup env check failed: ' + String(e));
  }

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
      },
    }),
  );

  // Attach global interceptor and exception filter
  nestApp.useGlobalInterceptors(new LoggingInterceptor());
  nestApp.useGlobalFilters(new SentryExceptionFilter());

  nestApp.useGlobalInterceptors(new SentryInterceptor());

  // Optional: trust proxy if behind load balancer
  if (process.env.TRUST_PROXY === '1') {
    expressApp.set('trust proxy', true as any);
  }

  await nestApp.init();

  const redisIoAdapter = new RedisIoAdapter(nestApp);
 await redisIoAdapter.connectToRedis();
 nestApp.useWebSocketAdapter(redisIoAdapter);


  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', String(reason));
    try {
      Sentry.captureException(reason as any);
    } catch {}
  });

  process.on('uncaughtException', (err) => {
    logger.error(
      'Uncaught Exception:',
      err instanceof Error ? err.stack || err.message : String(err),
    );
    try {
      Sentry.captureException(err as any);
    } catch {}
  });

 const raw = process.env.PORT;
if (!raw) {
  throw new Error('PORT is missing. Please check backend/.env.production');
}
const port = parseInt(raw, 10);

await nestApp.listen(port, '0.0.0.0');
logger.log(`Backend running inside Docker & listening on port ${port}`);

}

void bootstrap();