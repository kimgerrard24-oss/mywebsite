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

  /**
   * Called once on bootstrap
   * Use the same REDIS_CLIENT as the rest of the system
   */
  async connectToRedis(): Promise<void> {
    const redis = this.app.get<Redis>('REDIS_CLIENT');

    // Duplicate for pub / sub (required by socket.io)
    this.pubClient = redis.duplicate();
    this.subClient = redis.duplicate();

    await Promise.all([
      this.pubClient.connect(),
      this.subClient.connect(),
    ]);

    this.logger.log('RedisIoAdapter connected to Redis (pub/sub ready)');
  }

  /**
   * Override Socket.IO server creation
   * Ensures ALL gateways use the SAME adapter
   */
  createIOServer(
    port: number,
    options?: ServerOptions,
  ): Server {
    const server = super.createIOServer(port, {
      ...options,

      /**
       * IMPORTANT:
       * - must match client
       * - must match Caddy reverse proxy
       */
      path: '/socket.io',

      transports: ['websocket', 'polling'],
      allowUpgrades: true,
      allowEIO3: true,

      /**
       * Production-safe timeouts
       */
      pingInterval: 25000,
      pingTimeout: 20000,
      upgradeTimeout: 20000,

      /**
       * Cookie-based auth
       */
      cors: {
        origin: true,
        credentials: true,
      },
    });

    /**
     * 🔔 Attach Redis adapter (CRITICAL)
     */
    server.adapter(
      createAdapter(this.pubClient, this.subClient),
    );

    this.logger.log('Socket.IO Redis adapter attached');

    return server;
  }
}
