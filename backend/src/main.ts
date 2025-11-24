// backend/src/main.ts (or bootstrap.ts in your project)
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

import crypto from 'crypto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response } from 'express';

const logger = new Logger('bootstrap');

/**
 * Generate a cryptographically strong random state string
 */
function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a Redis client according to environment.
 */
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

  // When behind a reverse proxy (Caddy) set trust proxy to 1
  // so that secure/cookie/proxy-related headers are handled correctly.
  expressApp.set('trust proxy', 1);

  expressApp.use(helmet());

  // Register cookieParser early so req.cookies is available for routes/middleware.
  // (moved before cors to be defensive — cookieParser doesn't interfere with CORS,
  // but ensures req.cookies is populated for any middleware/route that runs next)
  expressApp.use(cookieParser());

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

  // ===============================================
  // CORS CONFIG
  // ===============================================
  const corsRegex = [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https?:\/\/test-localmywebsite\.com(:\d+)?$/,
    /^https?:\/\/([a-zA-Z0-9-]+\.)*test-localmywebsite\.com(:\d+)?$/,
    /^https?:\/\/([a-zA-Z0-9-]+\.)*mywebsite\.com(:\d+)?$/,
    /^https?:\/\/([a-zA-Z0-9-]+\.)*phlyphant\.com(:\d+)?$/,
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
        'Cookie', // <-- ensure Cookie header is allowed
      ],
      exposedHeaders: ['Set-Cookie'],
      optionsSuccessStatus: 204,
    }),
  );

  expressApp.use(json({ limit: '10mb' }));
  expressApp.use(urlencoded({ extended: true }));

  const httpServer = createServer(expressApp);

  // ===============================================
  // SOCKET.IO
  // ===============================================
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

  // Redis adapter for SIO
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

  // ===============================================
  // WEBSOCKET COOKIE VALIDATION
  // ===============================================
  io.use(async (socket, next) => {
    try {
      const headerCookie =
        (socket.handshake.headers.cookie as string | undefined) ??
        (socket.handshake.headers.Cookie as string | undefined) ??
        '';

      const raw = Array.isArray(headerCookie) ? headerCookie.join('; ') : headerCookie;
      const parsed = cookie.parse(raw || '');

      const name = process.env.SESSION_COOKIE_NAME || 'session';
      const sessionCookie = parsed[name];

      if (!sessionCookie) {
        (socket as any).user = null;
        return next();
      }

      const firebase = nestApp.get(FirebaseAdminService);
      const decoded = await firebase.auth().verifySessionCookie(sessionCookie, true).catch(() => null);

      if (!decoded) {
        (socket as any).user = null;
        return next();
      }

      (socket as any).user = decoded;
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

  // ===============================================
  // HYBRID OAUTH ROUTES (Google + Facebook)
  // ===============================================

  // Graph API version — default to v20.0 (safe / supported)
  const FACEBOOK_GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || 'v20.0';

  // Helper: validate minimal OAuth env before redirect
  function minimalGoogleConfigOk(): boolean {
    return Boolean(
      (process.env.GOOGLE_CLIENT_ID || '').trim() &&
        (process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URL || '').trim(),
    );
  }

  function minimalFacebookConfigOk(): boolean {
    return Boolean(
      (process.env.FACEBOOK_CLIENT_ID || '').trim() &&
        (process.env.FACEBOOK_CALLBACK_URL || process.env.FACEBOOK_REDIRECT_URL || '').trim(),
    );
  }

  // ----------- Step 1: redirect ----------
  expressApp.get('/auth/:provider/redirect', async (req: Request, res: Response) => {
    try {
      const provider = String(req.params.provider || '').toLowerCase();
      if (!['google', 'facebook'].includes(provider))
        return res.status(400).json({ error: 'unknown_provider' });

      const state = generateState();
      const stateKey = `oauth_state_${state}`;
      await redisClient.setex(stateKey, 300, '1').catch((e) => {
        logger.error('redis setex failed for state: ' + String(e));
      });

      // Set a compatibility cookie for older flows that expect oauth_state cookie
      // Use domain from env (recommended: .phlyphant.com) so cookie is accessible across subdomains.
      try {
        const cookieDomain = process.env.COOKIE_DOMAIN || '.phlyphant.com';
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('oauth_state', state, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'none',
          domain: cookieDomain,
          path: '/',
          maxAge: 5 * 60 * 1000,
        });
      } catch (e) {
        logger.warn('Failed to set oauth_state cookie (non-fatal): ' + String(e));
      }

      if (provider === 'google') {
        if (!minimalGoogleConfigOk()) {
          logger.error('Google OAuth misconfigured (missing client_id or redirect_uri)');
          return res.status(500).json({ error: 'oauth_misconfigured' });
        }

        const params = new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          redirect_uri: process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URL || '',
          response_type: 'code',
          scope: 'openid email profile',
          state,
          prompt: 'select_account',
        });

        return res.redirect(
          `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        );
      }

      if (provider === 'facebook') {
        if (!minimalFacebookConfigOk()) {
          logger.error('Facebook OAuth misconfigured (missing client_id or redirect_uri)');
          return res.status(500).json({ error: 'oauth_misconfigured' });
        }

        const params = new URLSearchParams({
          client_id: process.env.FACEBOOK_CLIENT_ID || '',
          redirect_uri: process.env.FACEBOOK_CALLBACK_URL || process.env.FACEBOOK_REDIRECT_URL || '',
          state,
          scope: 'email,public_profile',
          response_type: 'code',
        });

        // use GRAPH version in dialog URL
        return res.redirect(
          `https://www.facebook.com/${FACEBOOK_GRAPH_VERSION}/dialog/oauth?${params.toString()}`,
        );
      }

      return res.status(400).json({ error: 'unknown_provider' });
    } catch (err: unknown) {
      logger.error('redirect error', err);
      return res.status(500).json({ error: 'redirect_error' });
    }
  });

  // ----------- Step 2: callback ----------
  expressApp.get('/auth/:provider/callback', async (req: Request, res: Response) => {
    try {
      const provider = String(req.params.provider || '').toLowerCase();
      const code = (req.query.code as string) || '';
      const state = (req.query.state as string) || '';

      if (!code || !state) return res.status(400).send('Missing code or state');

      const stateKey = `oauth_state_${state}`;
      // <-- changed: allow cookie fallback if Redis key not present (compatibility)
      let validState = await redisClient.get(stateKey);

      // fallback: check oauth_state cookie (older flows / compatibility)
      const cookieState = (req.cookies as Record<string, string> | undefined)?.oauth_state;
      if (!validState && cookieState && cookieState === state) {
        validState = '1';
        logger.log('Accepted oauth_state from cookie fallback');
      }

      if (!validState) {
        logger.warn(`Invalid or expired oauth state. returned=${state}, cookie=${cookieState}`);
        return res.status(400).send('Invalid or expired state');
      }

      // remove redis key if present (best-effort)
      await redisClient.del(stateKey).catch(() => {});

      let tokenResult: any = null;
      let userInfo: any = null;

      if (provider === 'google') {
        // validate config again
        if (!minimalGoogleConfigOk()) {
          logger.error('Google OAuth misconfigured at callback stage');
          return res.status(500).send('oauth_misconfigured');
        }

        const googleTokenUrl = 'https://oauth2.googleapis.com/token';
        tokenResult = await axios.post(
          googleTokenUrl,
          new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            redirect_uri: process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT_URL || '',
            grant_type: 'authorization_code',
          }).toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000,
          },
        );

        const googleInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
        const infoRes = await axios.get(googleInfoUrl, {
          headers: { Authorization: `Bearer ${tokenResult.data.access_token}` },
          timeout: 10000,
        });
        userInfo = infoRes.data;

        const uid =
          userInfo.sub ||
          userInfo.id ||
          `google:${userInfo.email || uuidv4()}`;

        const firebase = nestApp.get(FirebaseAdminService);
        const firebaseCustomToken = await firebase.auth().createCustomToken(uid, {
          provider: 'google',
          email: userInfo.email,
          name: userInfo.name,
        });

        const oneTimeKey = `oauth_custom_token_${uuidv4()}`;
        await redisClient.setex(oneTimeKey, 120, firebaseCustomToken);

        const redirectBase =
          process.env.GOOGLE_PROVIDER_REDIRECT_AFTER_LOGIN ||
          'https://phlyphant.com';

        return res.redirect(`${redirectBase}?one_time_key=${oneTimeKey}`);
      }

      if (provider === 'facebook') {
        if (!minimalFacebookConfigOk()) {
          logger.error('Facebook OAuth misconfigured at callback stage');
          return res.status(500).send('oauth_misconfigured');
        }

        const fbTokenUrl = `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/oauth/access_token`;
        tokenResult = await axios.get(fbTokenUrl, {
          params: {
            client_id: process.env.FACEBOOK_CLIENT_ID || '',
            client_secret: process.env.FACEBOOK_CLIENT_SECRET || '',
            redirect_uri: process.env.FACEBOOK_CALLBACK_URL || process.env.FACEBOOK_REDIRECT_URL || '',
            code,
          },
          timeout: 10000,
        });

        const fbUserUrl = 'https://graph.facebook.com/me';
        const infoRes = await axios.get(fbUserUrl, {
          params: {
            fields: 'id,name,email,picture',
            access_token: tokenResult.data.access_token,
          },
          timeout: 10000,
        });

        userInfo = infoRes.data;
        const uid = `facebook:${userInfo.id || uuidv4()}`;

        const firebase = nestApp.get(FirebaseAdminService);
        const firebaseCustomToken = await firebase.auth().createCustomToken(uid, {
          provider: 'facebook',
          email: userInfo.email,
          name: userInfo.name,
        });

        const oneTimeKey = `oauth_custom_token_${uuidv4()}`;
        await redisClient.setex(oneTimeKey, 120, firebaseCustomToken);

        const redirectBase =
          process.env.FACEBOOK_PROVIDER_REDIRECT_AFTER_LOGIN ||
          'https://phlyphant.com';

        return res.redirect(`${redirectBase}?one_time_key=${oneTimeKey}`);
      }

      return res.status(400).json({ error: 'unknown_provider' });
    } catch (err: unknown) {
      logger.error('OAuth callback error', err);
      return res.status(500).json({ error: 'OAuth callback error' });
    }
  });

  // ----------- Step 3: custom token ----------
  expressApp.get('/auth/custom_token', async (req: Request, res: Response) => {
    try {
      const key = String(req.query.key || '');
      if (!key) return res.status(400).json({ error: 'missing_key' });

      const token = await redisClient.get(key);
      if (!token) return res.status(410).json({ error: 'token_missing_or_expired' });

      await redisClient.del(key).catch(() => {});
      return res.json({ customToken: token });
    } catch (err: unknown) {
      logger.error('custom_token error', err);
      return res.status(500).json({ error: 'internal_error' });
    }
  });

  // ----------- Step 6: create_session ----------
  expressApp.post('/auth/create_session', async (req: Request, res: Response) => {
    try {
      const idToken = String(req.body.idToken || '');
      if (!idToken) return res.status(400).json({ error: 'missing_idToken' });

      const firebase = nestApp.get(FirebaseAdminService);
      const decoded = await firebase.auth().verifyIdToken(idToken).catch(() => null);

      if (!decoded) return res.status(401).json({ error: 'invalid_idToken' });

      const expiresIn = Number(process.env.SESSION_COOKIE_MAX_AGE_MS || 432000000);
      const sessionCookie = await firebase.auth().createSessionCookie(idToken, { expiresIn });

      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
      const cookieName = process.env.SESSION_COOKIE_NAME || 'session';

      res.cookie(cookieName, sessionCookie, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'none',
        domain: cookieDomain,
        maxAge: expiresIn,
      });

      return res.json({ ok: true });
    } catch (err: unknown) {
      logger.error('create_session error', err);
      return res.status(500).json({ error: 'create_session_failed' });
    }
  });

  // ----------- logout ----------
  expressApp.post('/auth/logout', async (req: Request, res: Response) => {
    try {
      const cookieName = process.env.SESSION_COOKIE_NAME || 'session';
      const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

      res.clearCookie(cookieName, {
        domain: cookieDomain,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });

      return res.json({ ok: true });
    } catch (err: unknown) {
      logger.error('logout error', err);
      return res.status(500).json({ error: 'logout_failed' });
    }
  });

  await nestApp.init();

  const port = parseInt(process.env.PORT || '4001', 10);
  httpServer.listen(port, '0.0.0.0', () => {
    logger.log(`Backend running inside Docker & listening on port ${port}`);
  });
}

void bootstrap();
