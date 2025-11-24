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

// ===========================
//   SENTRY
// ===========================
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

const logger = new Logger('bootstrap');

function createRedisClient(): IORedis {
  const redisUrl =
    process.env.DOCKER_ENV === 'true'
      ? process.env.REDIS_URL || 'redis://redis:6379'
      : process.env.REDIS_URL || 'redis://localhost:6379';

  return new IORedis(redisUrl, { maxRetriesPerRequest: 5 });
}

async function bootstrap(): Promise<void> {
  const nestApp = await NestFactory.create(AppModule, { cors: false });
  const expressApp = nestApp.getHttpAdapter().getInstance() as Express;

  // trust proxy (for HTTPS cookies behind Caddy)
  expressApp.set('trust proxy', 1);

  expressApp.use(helmet());

  // cookie parsing
  expressApp.use(cookieParser());

  // ============================
  // CORS CONFIG
  // ============================
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

  const httpServer = createServer(expressApp);

  // ============================
  // SOCKET.IO
  // ============================
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

  // Redis adapter
  const redisUrl =
    process.env.DOCKER_ENV === 'true'
      ? process.env.REDIS_URL || 'redis://redis:6379'
      : process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    const opts = { maxRetriesPerRequest: null as any };
    const pub = new IORedis(redisUrl, opts);
    const sub = new IORedis(redisUrl, opts);
    io.adapter(createAdapter(pub, sub));
    logger.log('Redis adapter enabled for socket.io');
  } catch (e: unknown) {
    logger.error('Redis adapter failed: ' + String(e));
  }

  const redisClient = createRedisClient();
  redisClient.on('error', (err: unknown) => logger.error('Redis error', err));

  // ============================
  // WEBSOCKET COOKIE VALIDATION
  // ============================
  io.use(async (socket, next) => {
    try {
      const headerCookie =
        (socket.handshake.headers.cookie as string | undefined) ||
        (socket.handshake.headers.Cookie as string | undefined) ||
        '';

      const raw = Array.isArray(headerCookie) ? headerCookie.join('; ') : headerCookie;
      const parsed = cookie.parse(raw || '');

      // support both __session and session
      const sessionCookie =
        parsed['__session'] ||
        parsed[process.env.SESSION_COOKIE_NAME || 'session'];

      if (!sessionCookie) {
        (socket as any).user = null;
        return next();
      }

      const firebase = nestApp.get(FirebaseAdminService);

      const decoded = await firebase.auth().verifySessionCookie(sessionCookie, true)
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

  // =====================================================
  // IMPORTANT FIX:
  // Remove all hybrid OAuth routes here.
  // Allow AuthController to handle ALL /auth/* routing.
  // =====================================================
  // (No routes override in main.ts)

  await nestApp.init();

  const port = parseInt(process.env.PORT || '4001', 10);
  httpServer.listen(port, '0.0.0.0', () => {
    logger.log(`Backend running inside Docker & listening on port ${port}`);
  });
}

void bootstrap();
