// ==========================================
// file: backend/src/socket/redis-io.adapter.ts
// ==========================================

import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ServerOptions, Server } from 'socket.io';
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
  }

  async connectToRedis(): Promise<void> {
    const redis = this.app.get<Redis>('REDIS_CLIENT');

    // duplicate only (DO NOT call connect)
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

    server.adapter(
      createAdapter(this.pubClient, this.subClient),
    );

    this.logger.log('Socket.IO Redis adapter attached');

    return server;
  }
}
