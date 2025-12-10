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
import { LocalRefreshModule } from './dto/local/local-refresh.module';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetTokenRepository } from './password-reset-token.repository';
import { PasswordResetMailService } from '../mail/password-reset-mail.service';
import { UsersService } from '../users/users.service';
import { ValidateSessionService } from './services/validate-session.service';
import { AccessTokenCookieAuthGuard } from './guards/access-token-cookie.guard';

@Module({
  imports: [
    SecretsModule,
    FirebaseAdminModule,
    PrismaModule,
    RedisModule,
    RateLimitModule,
    MailModule,
    LocalRefreshModule,
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
    UsersService,
    RateLimitGuard,
    RedisService,
    PasswordResetService,
    PasswordResetTokenRepository,
    PasswordResetMailService,
    ValidateSessionService, 
    AccessTokenCookieAuthGuard,

    /*
      NOTE:
      DO NOT apply AuthRateLimitGuard globally using APP_GUARD here.
      This must be applied only at route-level.
      Example:
      @UseGuards(AuthRateLimitGuard)
      on request-password-reset and reset-password routes.

      This ensures:
      - Public routes can be rate-limited
      - Authenticated routes do not get blocked unexpectedly
    */
  ],

  controllers: [
    AuthController,
    SocialAuthController,
    PasswordResetController,
  ],

  exports: [
    FirebaseAuthGuard,
    AuthService,
    AuditService,
    JwtAuthGuard,
    ValidateSessionService, 
    AccessTokenCookieAuthGuard,
  ],
})
export class AuthModule {}
