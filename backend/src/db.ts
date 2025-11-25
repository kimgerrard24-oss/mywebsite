// ==============================
// file: src/db.ts
// ==============================

import { PrismaClient } from '@prisma/client';

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';

// Use global singleton only in development
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Safety: production must have DATABASE_URL
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  throw new Error('DATABASE_URL missing in environment variables');
}

export const prisma =
  isProduction
    ? new PrismaClient({
        log: ['error', 'warn'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      })
    : globalForPrisma.prisma ||
      new PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
