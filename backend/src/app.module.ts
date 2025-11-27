// ==========================================
// file: backend/src/app.module.ts
// ==========================================

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
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
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// เพิ่มตามคำสั่งของคุณ
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';

// *** ADD THIS: R2 Module ***
import { R2Module } from './r2/r2.module';

@Module({
  imports: [
    // Load ENV first
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env',
      isGlobal: true,
      cache: true,
    }),

    SecretsModule,
    FirebaseAdminModule,
    AuthModule,

    AwsModule,

    // *** MUST ADD R2 MODULE HERE ***
    R2Module,

    HealthModule,
    PrismaModule,
    RedisModule,
    AppCacheModule,
    QueueModule,

    SentryModule.forRoot(),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
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
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieParser(process.env.SECRET_KEY),
        helmet({
          contentSecurityPolicy: false,
          crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
        }),
      )
      .forRoutes('*');
  }
}
