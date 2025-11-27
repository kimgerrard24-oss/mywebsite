// ==========================================
// file: backend/src/health/health.module.ts
// ==========================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SystemCheckController } from './system-check.controller';
import { SystemCheckService } from './system-check.service';

import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [
    // Fixed: ไม่ต้อง ConfigModule.forRoot ที่นี่
    // ใช้ Global ConfigModule จาก AppModule แทน
    ConfigModule,

    PrismaModule,
    RedisModule,
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
