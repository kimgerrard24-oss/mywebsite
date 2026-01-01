// file: backend/src/app.module.ts
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
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseAdminModule } from './firebase/firebase.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { R2Module } from './r2/r2.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { TestRateModule } from './modules/test/test.module';
import { UsersModule } from './users/users.module';
import { LocalRefreshModule } from './auth/dto/local/local-refresh.module';
import { PostsModule } from './posts/posts.module';
import { MediaModule } from './media/media.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertModule } from './alert/alert.module';
import { FollowsModule } from './follows/follows.module';
import { FollowingModule } from './following/following.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env',
      isGlobal: true,
      cache: true,
    }),
    
    ScheduleModule.forRoot(),
    AlertModule,
    ChatModule,
    SearchModule,
    NotificationsModule,
    FollowsModule,
    FollowingModule,
    SecretsModule,
    FirebaseAdminModule,
    PrismaModule,
    MediaModule,
    RedisModule,
    AuthModule,
    AwsModule,
    R2Module,
    RateLimitModule,
    HealthModule,
    AppCacheModule,
    QueueModule,
    TestRateModule,
    UsersModule,
    PostsModule,
    LocalRefreshModule,
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

  controllers: [AppController],

  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
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

