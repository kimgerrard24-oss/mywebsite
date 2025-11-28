// ==========================================
// file: src/queue/queue.module.ts
// ==========================================

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import type { Redis as RedisClient, RedisOptions } from 'ioredis';

// Re-use Redis options from global configuration
function buildRedisOptions(): RedisOptions {
  return {
    enableReadyCheck: true,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      return Math.min(times * 100, 2000);
    },
  };
}

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: ['REDIS_CLIENT'],
      useFactory: async (redisClient: RedisClient) => {
        const options = buildRedisOptions();

        return {
          createClient: (_type: string) => {
            return redisClient.duplicate(options);
          },
        };
      },
    }),

    BullModule.registerQueue({
      name: 'default',
    }),
  ],
})
export class QueueModule {}
