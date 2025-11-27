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

// === เพิ่มตามคำขอ ===
import { firebaseAdminProvider } from './firebase-admin.provider';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  imports: [
    SecretsModule,
    FirebaseAdminModule,
    PrismaModule,
    RedisModule,
  ],

  providers: [
    AuthService,

    // === เพิ่มตามคำขอ ===
    firebaseAdminProvider,
    FirebaseService,
    FirebaseAuthGuard,
  ],

  controllers: [AuthController],

  exports: [
    AuthService,

    // === เพิ่มตามคำขอ ===
    FirebaseService,
    FirebaseAuthGuard,
  ],
})
export class AuthModule {}
