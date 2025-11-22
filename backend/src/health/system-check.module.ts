// ==========================================
// file: src/system-check/system-check.module.ts
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SystemCheckController } from './system-check.controller';
import { SystemCheckService } from './system-check.service';

// ⭐ ต้อง import modules ที่มี providers เพื่อให้ DI ทำงานถูกต้อง
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

// ⭐ เพิ่มเติมสำหรับ ENV, Firebase Admin, AWS Secrets, AWS S3
import { AwsModule } from '../aws/aws.module';
import { FirebaseAdminModule } from '../firebase/firebase.module';

@Module({
  imports: [
    // โหลด ENV แบบ Global (Production ใช้ process.env ตรง ๆ)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,       // ⭐ PrismaService
    RedisModule,        // ⭐ REDIS_CLIENT
    AwsModule,          // ⭐ AWS Secrets / S3 Client
    FirebaseAdminModule // ⭐ Firebase Admin
  ],
  controllers: [SystemCheckController],
  providers: [SystemCheckService],
})
export class SystemCheckModule {}
