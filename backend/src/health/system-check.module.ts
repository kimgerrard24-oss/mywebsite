// ==========================================
// file: src/system-check/system-check.module.ts
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SystemCheckController } from './system-check.controller';
import { SystemCheckService } from './system-check.service';

import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AwsModule } from '../aws/aws.module';
import { FirebaseAdminModule } from '../firebase/firebase.module';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [
    // FIX: ไม่ต้อง forRoot() ที่นี่
    // ใช้ Global ConfigModule จาก AppModule แทน
    ConfigModule,

    PrismaModule,
    RedisModule,
    AwsModule,
    FirebaseAdminModule,
    R2Module,
  ],
  controllers: [SystemCheckController],
  providers: [SystemCheckService],
})
export class SystemCheckModule {}
