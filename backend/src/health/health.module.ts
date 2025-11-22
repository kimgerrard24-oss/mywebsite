import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SystemCheckController } from './system-check.controller';
import { SystemCheckService } from './system-check.service';

// Import Prisma & Redis module for DI
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    // Load environment variables for OAuth / Firebase / JWT / S3 / Redis
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),

    PrismaModule,
    RedisModule,
  ],

  controllers: [
    HealthController,
    SystemCheckController,
  ],

  providers: [
    HealthService,
    SystemCheckService,
  ],
})
export class HealthModule {}
