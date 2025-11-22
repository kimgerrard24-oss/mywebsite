// ==========================================
// file: src/prisma/prisma.service.ts
// ==========================================

import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['query', 'error', 'warn', 'info'],
    });
  }

  async onModuleInit() {
    const maxRetries = parseInt(process.env.PRISMA_CONNECT_RETRIES || '5', 10);
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        attempts++;
        this.logger.log(
          `Connecting to PostgreSQL using Prisma (attempt ${attempts}/${maxRetries})`,
        );

        await this.$connect();

        this.logger.log('Prisma successfully connected to PostgreSQL');
        return;
      } catch (err) {
        this.logger.error(
          `Prisma connection error on attempt ${attempts}: ${(err as Error).message}`,
        );

        if (attempts >= maxRetries) {
          this.logger.error(
            'Prisma failed to connect after maximum retry attempts. Exiting.',
          );
          throw err;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log('Disconnecting Prisma from PostgreSQL');
      await this.$disconnect();
      this.logger.log('Prisma disconnected successfully');
    } catch (err) {
      this.logger.error(
        `Error during Prisma disconnect: ${(err as Error).message}`,
      );
    }
  }
}
