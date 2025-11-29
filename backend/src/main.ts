//  src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type { Express } from 'express';
import cors from 'cors';
import { createAdapter } from '@socket.io/redis-adapter';
import IORedis from 'ioredis';
import { json, urlencoded } from 'express';
import './instrument';
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENV || 'development',
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),
});
import { SentryInterceptor } from './sentry.interceptor';
import helmet from 'helmet';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { FirebaseAdminService } from './firebase/firebase.service';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { RateLimitGuard } from './common/rate-limit/rate-limit.guard';
import { RateLimitService } from './common/rate-limit/rate-limit.service';
import { Reflector } from '@nestjs/core';

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

function createRedisClient(): IORedis {
  return new IORedis(getRedisUrl(), redisOptions());
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
  const nestApp = await NestFactory.create(AppModule, { cors: false });
  const expressApp = nestApp.getHttpAdapter().getInstance() as Express;

  // ============================================
  // Added: Global RateLimit Guard (ตามที่คุณขอ)
  // - Use the RateLimitService and the Reflector from the DI container
  // ============================================
  const rateLimitService = nestApp.get(RateLimitService);
  const reflector = nestApp.get(Reflector);
  nestApp.useGlobalGuards(new RateLimitGuard(rateLimitService, reflector));
  // ============================================

  expressApp.set('trust proxy', true);
  expressApp.use(helmet());
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

  expressApp.use(
    '/auth/local/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many login attempts from this IP, please try again later',
    }),
  );

  expressApp.use(
    '/auth/local/request-password-reset',
    rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many password reset requests from this IP, please try again later',
    }),
  );

  try {
    const googleProviderRedirect = process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN || '';
    const facebookProviderRedirect = process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN || '';
    const cookieDomain = process.env.COOKIE_DOMAIN || '';
    const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'session';

    const normalizedGoogleOrigin = normalizeToOrigin(googleProviderRedirect);
    const normalizedFacebookOrigin = normalizeToOrigin(facebookProviderRedirect);

    logger.log(`Startup check: COOKIE_DOMAIN=${cookieDomain || '<not set>'}`);
    logger.log(`Startup check: SESSION_COOKIE_NAME=${sessionCookieName}`);
    logger.log(`Startup check: GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN (raw)=${googleProviderRedirect ? '<set>' : '<not set>'}`);
    if (googleProviderRedirect) {
      logger.log(`Startup check: GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN (origin)=${normalizedGoogleOrigin || '<invalid URL>'}`);
    }
    logger.log(`Startup check: FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN (raw)=${facebookProviderRedirect ? '<set>' : '<not set>'}`);
    if (facebookProviderRedirect) {
      logger.log(`Startup check: FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN (origin)=${normalizedFacebookOrigin || '<invalid URL>'}`);
    }

    if (/(\/auth\/?complete)/i.test(googleProviderRedirect)) {
      logger.warn('GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN contains path like /auth/complete — this may cause duplicated redirects');
    }
    if (/(\/auth\/?complete)/i.test(facebookProviderRedirect)) {
      logger.warn('FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN contains path like /auth/complete — this may cause duplicated redirects');
    }
  } catch (e) {
    logger.warn('Startup env check failed: ' + String(e));
  }

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false },
    }),
  );

  nestApp.useGlobalInterceptors(new SentryInterceptor());

  expressApp.use(json({ limit: '10mb' }));
  expressApp.use(urlencoded({ extended: true }));

  await nestApp.init();

  const httpServer = createServer(expressApp);

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const ok = corsRegex.some((r) => r.test(origin));
        return ok ? cb(null, true) : cb(new Error('Socket CORS blocked'));
      },
      credentials: true,
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
    allowEIO3: true,
    pingInterval: 25000,
    pingTimeout: 20000,
    upgradeTimeout: 20000,
    maxHttpBufferSize: 1e8,
  });

  try {
    const redisUrl = getRedisUrl();
    const opts = redisOptions();

    const pub = new IORedis(redisUrl, opts);
    const sub = new IORedis(redisUrl, opts);

    if (pub.status !== 'connecting' && pub.status !== 'ready') {
      await pub.connect().catch((err) => {
        throw new Error('Redis pub connection failed: ' + String(err));
      });
    }

    if (sub.status !== 'connecting' && sub.status !== 'ready') {
      try {
        await sub.connect().catch((err) => {
          throw new Error('Redis sub connection failed: ' + String(err));
        });
      } catch (e) {
        try {
          await pub.disconnect();
        } catch {}
        throw e;
      }
    }

    io.adapter(createAdapter(pub, sub));
    logger.log('Redis adapter enabled for socket.io');
  } catch (e: unknown) {
    logger.error('Redis adapter failed: ' + String(e));
  }

  const redisClient = createRedisClient();
  redisClient.on('error', (err: unknown) => logger.error('Redis error', err));

  try {
    if (redisClient.status !== 'connecting' && redisClient.status !== 'ready') {
      await redisClient.connect().catch((err) => {
        logger.error('Redis client connect failed: ' + String(err));
      });
    }
  } catch {}

  io.use(async (socket, next) => {
    try {
      const headerCookie =
        (socket.handshake.headers.cookie as string | undefined) ||
        (socket.handshake.headers.Cookie as string | undefined) ||
        '';

      const raw = Array.isArray(headerCookie) ? headerCookie.join('; ') : headerCookie;
      const parsed = cookie.parse(raw || '');

      const sessionCookie =
        parsed['__session'] ||
        parsed[process.env.SESSION_COOKIE_NAME || 'session'];

      if (!sessionCookie) {
        (socket as any).user = null;
        return next();
      }

      const firebase = nestApp.get(FirebaseAdminService);

      const decoded = await firebase
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .catch(() => null);

      (socket as any).user = decoded || null;
      return next();
    } catch {
      (socket as any).user = null;
      return next();
    }
  });

  io.on('connection', (socket) => {
    socket.on('ping', (cb) => {
      cb({ pong: true, serverTime: Date.now() });
    });
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', String(reason));
    try {
      Sentry.captureException(reason as any);
    } catch {}
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err instanceof Error ? err.stack || err.message : String(err));
    try {
      Sentry.captureException(err as any);
    } catch {}
  });

  const port = parseInt(process.env.PORT || '4001', 10);
  httpServer.listen(port, '0.0.0.0', () => {
    logger.log(`Backend running inside Docker & listening on port ${port}`);
  });
}

void bootstrap();
