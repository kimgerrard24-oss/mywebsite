// ==========================================
// file: src/prisma/prisma.module.ts
// ==========================================

import { Global, Module, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit {
  private readonly logger = new Logger(PrismaModule.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const maxRetries = parseInt(process.env.PRISMA_CONNECT_RETRIES || '5', 10);
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        attempts++;
        this.logger.log(
          `Connecting to PostgreSQL (attempt ${attempts}/${maxRetries})...`,
        );

        await this.prisma.$connect();

        this.logger.log('Prisma successfully connected to PostgreSQL database');
        return;
      } catch (err) {
        this.logger.error(
          `Prisma connection failed on attempt ${attempts}: ${(err as Error).message}`,
        );

        if (attempts >= maxRetries) {
          this.logger.error(
            'Prisma failed to connect after maximum retry attempts. Exiting.',
          );
          throw err;
        }

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, 1500),
        );
      }
    }
  }
}
