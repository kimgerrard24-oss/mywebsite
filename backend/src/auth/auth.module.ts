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
import { JwtStrategy } from './jwt.strategy';
import { AuthRepository } from './auth.repository';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { MailModule } from '../mail/mail.module';
import { AuditService } from './audit.service';
import { AuthGuard } from './auth.guard';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';
import { RedisService } from '../redis/redis.service';


@Module({
  imports: [
    SecretsModule,
    FirebaseAdminModule,
    PrismaModule,
    RedisModule,
    RateLimitModule,
    MailModule,
  ],

  providers: [
    AuthService,
    AuthRepository,
    AuthLoggerService,
    JwtAuthGuard,
    JwtStrategy,
    FirebaseAuthGuard,
    AuditService,
    AuthGuard,
    RateLimitGuard,
    RedisService,

    // FIX:
    // Do NOT apply AuthRateLimitGuard globally as APP_GUARD
    // It must be attached at controller/route-level only.
  ],

  controllers: [
    AuthController,
    SocialAuthController,
  ],

  exports: [
    FirebaseAuthGuard,
    AuthService,
    AuditService,
  ],
})
export class AuthModule {}
