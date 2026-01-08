// ==========================================
// file: backend/src/socket/redis-io.adapter.ts
// ==========================================

import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  INestApplicationContext,
  Logger,
} from '@nestjs/common';
import {
  ServerOptions,
  Server,
  Socket,
} from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type Redis from 'ioredis';
import type { Request } from 'express';
import cookieParser from 'cookie-parser';
import { ValidateSessionService } from '../auth/services/validate-session.service';
import { SecurityEventService } from '../common/security/security-event.service';
import * as Sentry from '@sentry/node';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);

  private pubClient!: Redis;
  private subClient!: Redis;

  constructor(
    private readonly app: INestApplicationContext,
  ) {
    super(app);
    this.logger.log('RedisIoAdapter constructed');
  }

  async connectToRedis(): Promise<void> {
    this.logger.log('connectToRedis() called');

    const redis = this.app.get<Redis>('REDIS_CLIENT');

    this.pubClient = redis.duplicate();
    this.subClient = redis.duplicate();

    this.logger.log(
      'RedisIoAdapter using duplicated Redis clients (pub/sub)',
    );
  }

  createIOServer(
    port: number,
    options?: ServerOptions,
  ): Server {
    this.logger.log(
      `createIOServer() called on port=${port}`,
    );

    const server = super.createIOServer(port, {
      ...options,
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      allowUpgrades: true,
      pingInterval: 25000,
      pingTimeout: 20000,
      cors: {
        origin: true,
        credentials: true,
      },
    });

    this.logger.log('Socket.IO server instance created');

    server.adapter(
      createAdapter(this.pubClient, this.subClient),
    );

    this.logger.log('Socket.IO Redis adapter attached');

    // =====================================
    // SOCKET AUTH (HANDSHAKE LEVEL)
    // =====================================
    server.use(
  async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const req = socket.request as Request;

      // 🔑 parse cookies for socket
      cookieParser()(req as any, {} as any, () => {});

      const validateSession =
        this.app.get(ValidateSessionService);

      const user =
        await validateSession.validateAccessTokenFromRequest(req);

      (socket as any).user = user;

      // auto join per-user room
      socket.join(`user:${user.userId}`);

      this.logger.log(
        `[socket] authenticated user=${user.userId} socket=${socket.id}`,
      );

      next();
    } catch (err) {
      // ===============================
      // classify reason (log only)
      // ===============================
      let reason = 'unauthorized';

      if (err instanceof Error) {
        const msg = err.message?.toLowerCase?.() || '';

        if (msg.includes('cookie')) {
          reason = 'missing_cookie';
        } else if (msg.includes('jwt')) {
          reason = 'jwt_invalid';
        } else if (msg.includes('session')) {
          reason = 'session_revoked';
        } else if (msg.includes('banned')) {
          reason = 'banned_user';
        }
      }

      // ===============================
      // Security Event (centralized)
      // ===============================
      try {
        const securityEvent =
          this.app.get(SecurityEventService);

        securityEvent.log({
          type: 'security.abuse.detected', // ✅ ใช้ type ที่มีจริง
          severity: 'warning',
          meta: {
            channel: 'socket',
            reason,
            socketId: socket.id,
            transport: socket.conn.transport.name,
          },
        });
      } catch {
        // must never block socket flow
      }

      // ===============================
      // Sentry only for abnormal error
      // ===============================
      if (reason === 'unauthorized') {
        try {
          Sentry.withScope((scope) => {
            scope.setTag('domain', 'socket-auth');
            scope.setTag('socket.id', socket.id);
            Sentry.captureException(err as any);
          });
        } catch {
          // ignore
        }
      }

      this.logger.warn(
        `[socket] authentication failed socket=${socket.id} reason=${reason}`,
      );

      // ❗ do NOT leak reason to client
      next(new Error('UNAUTHORIZED'));
    }
  },
);


    this.logger.log(
      'Socket.IO auth middleware registered',
    );

    return server;
  }
}
