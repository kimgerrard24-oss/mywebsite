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

import { AuthRepository } from './auth.repository';
import { AuthLoggerService } from '../common/logging/auth-logger.service';
import { SessionController } from './session.controller';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AuthGuard } from './auth.guard';
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard';

import { AuditService } from './audit.service';
import { RedisService } from '../redis/redis.service';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetTokenRepository } from './password-reset-token.repository';
import { ValidateSessionService } from './services/validate-session.service';
import { AccessTokenCookieAuthGuard } from './guards/access-token-cookie.guard';
import { SessionModule } from './session/session.module';
import { CredentialVerificationModule } from './credential-verification.module';

@Module({
  imports: [
    SecretsModule,
    FirebaseAdminModule,
    PrismaModule,
    CredentialVerificationModule,
    RedisModule,
    RateLimitModule,
    MailModule,
    SessionModule,
    CredentialVerificationModule,
  ],

  providers: [
    AuthService,
    AuthRepository,
    AuthLoggerService,
    FirebaseAuthGuard,
    AuthGuard,
    RateLimitGuard,
    AuditService,
    RedisService,
    PasswordResetService,
    PasswordResetTokenRepository,
    ValidateSessionService,
    AccessTokenCookieAuthGuard,
  ],

  controllers: [
    AuthController,
    SocialAuthController,
    PasswordResetController,
    SessionController,
  ],

  exports: [
    FirebaseAuthGuard,
    AuthService,
    AuditService,
    ValidateSessionService,
    AccessTokenCookieAuthGuard,
  ],
})
export class AuthModule {}
