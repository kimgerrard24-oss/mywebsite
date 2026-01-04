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
import { ValidateSessionService } from '../auth/services/validate-session.service';

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

    this.logger.log(
      'Socket.IO server instance created',
    );

    server.adapter(
      createAdapter(this.pubClient, this.subClient),
    );

    this.logger.log(
      'Socket.IO Redis adapter attached',
    );

    // ============================
    // 🔐 SOCKET AUTH MIDDLEWARE
    // ============================
    server.use(
      async (
        socket: Socket,
        next: (err?: Error) => void,
      ) => {
        this.logger.debug(
          `[middleware] Incoming socket id=${socket.id}`,
        );

        try {
          const req = socket.request as Request;

          if (!req) {
            this.logger.error(
              `[middleware] socket.request is undefined (socket=${socket.id})`,
            );
            return next(new Error('INVALID_REQUEST'));
          }

          const cookieHeader =
            req.headers?.cookie;

          this.logger.debug(
            `[middleware] cookie header=${cookieHeader ? 'present' : 'missing'} socket=${socket.id}`,
          );

          const validateSession =
            this.app.get(ValidateSessionService);

          const user =
            await validateSession.validateAccessTokenFromRequest(
              req,
            );

          if (!user) {
            this.logger.warn(
              `[middleware] validateSession returned empty user (socket=${socket.id})`,
            );
            return next(new Error('UNAUTHORIZED'));
          }

          (socket as any).user = user;

          // 🔑 auto-join user room (CRITICAL)
          const room = `user:${user.userId}`;
          socket.join(room);

          this.logger.log(
            `[middleware] socket=${socket.id} joined room=${room}`,
          );

          next();
        } catch (err) {
          this.logger.error(
            `[middleware] socket auth failed (socket=${socket.id})`,
            err instanceof Error
              ? err.stack
              : String(err),
          );
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
