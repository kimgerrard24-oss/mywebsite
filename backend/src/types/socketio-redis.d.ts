// src/socketio-redis.d.ts

import type { RedisClientType } from 'redis';
import type { AdapterConstructor } from 'socket.io-adapter';

declare module '@socket.io/redis-adapter' {
  export function createAdapter(
    pubClient: RedisClientType<any, any, any>,
    subClient: RedisClientType<any, any, any>,
    opts?: Record<string, unknown>,
  ): AdapterConstructor;
}
