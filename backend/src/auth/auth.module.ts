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
import { MailModule } from '../mail/mail.module';

import { AuthLoggerService } from '../common/logging/auth-logger.service';
import { AuthRepository } from './auth.repository';
import { AuditService } from './audit.service';

import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { FirebaseAuthGuard } from './firebase-auth.guard';

// IMPORTANT: re-add this
import { AuthRateLimitGuard } from '../common/rate-limit/auth-rate-limit.guard';

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

    // ADD BACK AS APP_GUARD
    {
      provide: APP_GUARD,
      useClass: AuthRateLimitGuard,
    },
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
