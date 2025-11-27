// ==========================================
// file: src/system-check/system-check.module.ts
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SystemCheckController } from './system-check.controller';
import { SystemCheckService } from './system-check.service';

// Modules for DI
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

// Additional modules (Firebase, AWS)
import { AwsModule } from '../aws/aws.module';
import { FirebaseAdminModule } from '../firebase/firebase.module';

// FIX: ต้อง import R2Module ให้ R2Service สามารถ inject ได้
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    RedisModule,
    AwsModule,
    FirebaseAdminModule,

    // FIX: เพิ่ม R2Module
    R2Module,
  ],
  controllers: [SystemCheckController],
  providers: [SystemCheckService],
})
export class SystemCheckModule {}
