// ==============================
// file: src/auth/auth.module.ts
// ==============================
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { SecretsModule } from '../secrets/secrets.module';
import { FirebaseAdminModule } from '../firebase/firebase.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({
  imports: [
    // Ensure secrets load BEFORE strategies
    SecretsModule,
    forwardRef(() => SecretsModule),

    FirebaseAdminModule,
    PrismaModule,

    // Required for OAuth state / CSRF / Session
    RedisModule,
  ],

  providers: [
    AuthService,

    // OAuth Strategies (must load after secrets)
    GoogleStrategy,
    FacebookStrategy,
  ],

  controllers: [AuthController],

  exports: [
    AuthService,
  ],
})
export class AuthModule {}
