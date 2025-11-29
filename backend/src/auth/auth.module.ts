// ==============================
// file: src/auth/auth.module.ts
// ==============================
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RateLimitModule } from 'src/common/rate-limit/rate-limit.module';
import { SecretsModule } from '../secrets/secrets.module';
import { FirebaseAdminModule } from '../firebase/firebase.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

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
  ],

  controllers: [AuthController],

  exports: [
    AuthService,           
  ],
})
export class AuthModule {}
