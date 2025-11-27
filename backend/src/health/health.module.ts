import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SystemCheckController } from './system-check.controller';
import { SystemCheckService } from './system-check.service';

// Import Prisma & Redis module for DI
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

// FIX: ต้อง import R2Module เพื่อให้ R2Service ถูก inject ได้
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),

    PrismaModule,
    RedisModule,

    // FIX: เพิ่ม R2Module
    R2Module,
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
