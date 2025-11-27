// ==============================
// file: src/auth/auth.module.ts
// ==============================
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { SecretsModule } from '../secrets/secrets.module';
import { FirebaseAdminModule } from '../firebase/firebase.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    SecretsModule,
    FirebaseAdminModule,   // ใช้อันนี้สำหรับ Firebase Admin SDK
    PrismaModule,
    RedisModule,
  ],

  providers: [
    AuthService,           // ปกติ — ไม่แก้
  ],

  controllers: [AuthController],

  exports: [
    AuthService,           // เฉพาะ AuthService ที่จำเป็นต้อง export
  ],
})
export class AuthModule {}
