// ==========================================
// file: src/queue/queue.module.ts
// ==========================================

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

// Safe loader for production
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

@Module({
  imports: [
    // Use Redis URL from environment (production-safe)
    BullModule.forRoot({
      redis: requireEnv('REDIS_URL'),
    }),

    // Default queue (leave unchanged as requested)
    BullModule.registerQueue({
      name: 'default',
    }),
  ],
})
export class QueueModule {}
