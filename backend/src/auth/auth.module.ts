// file: src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SocialAuthController } from './social.controller';
import { SecretsModule } from '../secrets/secrets.module';
import { FirebaseAdminModule } from '../firebase/firebase.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { RateLimitModule } from '../common/rate-limit/rate-limit.module';
import { AuthRateLimitGuard } from '../common/rate-limit/auth-rate-limit.guard';
import { AuthLoggerService } from '../common/logging/auth-logger.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuditService } from './audit.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  imports: [
    SecretsModule,
    FirebaseAdminModule,
    PrismaModule,
    RedisModule,
    RateLimitModule,
  ],

  providers: [
    AuthService,
    AuthRepository,
    AuthLoggerService,
    JwtAuthGuard,
    JwtStrategy,
    AuditService,
    PrismaService,
    FirebaseAuthGuard,

    {
      provide: APP_GUARD,
      useClass: AuthRateLimitGuard,
    },
  ],

  controllers: [
    AuthController,
    SocialAuthController
  ],

  exports: [FirebaseAuthGuard, AuthService],
})
export class AuthModule {}
