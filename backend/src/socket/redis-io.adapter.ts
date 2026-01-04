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
} from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type Redis from 'ioredis';

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

    /**
     * ❗ IMPORTANT
     * - DO NOT authenticate socket here
     * - Auth must be handled by WsAuthGuard
     * - IoAdapter must stay infrastructure-only
     */

    return server;
  }
}
