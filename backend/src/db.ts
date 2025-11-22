// src/db.ts
import { PrismaClient } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

// In development mode, use global singleton to prevent multiple instances during hot reload.
// In production (Docker), always create a fresh PrismaClient instance.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  isProduction
    ? new PrismaClient({
        log: ['error', 'warn'],
        datasources: {
          db: {
            // Must match backend/.env.production
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
