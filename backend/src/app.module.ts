// ==========================================
// file: backend/src/app.module.ts
// ==========================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './aws/aws.module';
import { AuthModule } from './auth/auth.module';
import { SecretsModule } from './secrets/secrets.module';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { AppCacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UsersTestController } from './users/users.controller';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseAdminModule } from './firebase/firebase.module';

// ❗ FIX: cookie-parser default import
import cookieParser from 'cookie-parser';

import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import helmet from 'helmet';

@Module({
  imports: [
    // ===============================================
    // Secrets MUST load before Firebase/Auth modules
    // ===============================================
    SecretsModule,

    // ===============================================
    // Load ENV (.env.production) globally
    // ===============================================
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env',
      isGlobal: true,
      cache: true,
    }),

    // ===============================================
    // Global Rate Limit (Security Hardening)
    // ===============================================
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),

    // ===============================================
    // Firebase Admin MUST load before AuthModule
    // ===============================================
    FirebaseAdminModule,

    // ===============================================
    // AuthModule — Hybrid OAuth + Firebase Admin Login
    // ===============================================
    AuthModule,

    AwsModule,
    HealthModule,
    PrismaModule,
    RedisModule,
    AppCacheModule,
    QueueModule,

    // ===============================================
    // Global Sentry Error Monitoring
    // ===============================================
    SentryModule.forRoot(),
  ],

  controllers: [AppController, UsersTestController],

  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // ==========================================================
    // Global Security Middleware
    // ==========================================================
    consumer
      .apply(
        // ❗ FIX: cookieParser default import usage
        cookieParser(process.env.SECRET_KEY),

        helmet({
          contentSecurityPolicy: false,
          crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
        }),
      )
      .forRoutes('*');
  }
}
