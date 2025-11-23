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

import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    SecretsModule,
    FirebaseAdminModule,
    PrismaModule,
    RedisModule, // optional แต่ปล่อยไว้ได้
  ],

  providers: [
    AuthService,

    // ✔ ใช้แค่ Google Strategy ที่ยังใช้ Passport
    GoogleStrategy,
  ],

  controllers: [AuthController],

  exports: [AuthService],
})
export class AuthModule {}
