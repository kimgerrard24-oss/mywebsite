// ==========================================
// file: src/system-check/system-check.module.ts
// ==========================================
import { Module } from '@nestjs/common';
import { SystemCheckController } from './system-check.controller';
import { SystemCheckService } from './system-check.service';

import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    R2Module,      // required for r2.healthCheck()
  ],
  controllers: [SystemCheckController],
  providers: [SystemCheckService],
})
export class SystemCheckModule {}
