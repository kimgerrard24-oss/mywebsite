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

// Parse redis:// URL into host/port for Bull v3
function parseRedisUrl(url: string) {
  try {
    const u = new URL(url); // native URL parser
    return {
      host: u.hostname,
      port: Number(u.port) || 6379,
    };
  } catch {
    throw new Error(`Invalid REDIS_URL format: ${url}`);
  }
}

@Module({
  imports: [
    // Correct Bull Redis config (Bull v3 requires host/port, not url)
    BullModule.forRoot({
      redis: parseRedisUrl(requireEnv('REDIS_URL')),
    }),

    // Default queue (unchanged)
    BullModule.registerQueue({
      name: 'default',
    }),
  ],
})
export class QueueModule {}
