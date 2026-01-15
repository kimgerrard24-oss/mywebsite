// ==============================
// file: backend/src/auth/credential-verification.module.ts
// ==============================

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

import { CredentialVerificationService } from './credential-verification.service';

@Module({
  imports: [
    PrismaModule, // DB authority
    RedisModule,  // rate / token / temp state (if used internally)
  ],

  providers: [
    CredentialVerificationService,
  ],

  exports: [
    CredentialVerificationService, // allow AuthModule / SecuritiesModule to inject
  ],
})
export class CredentialVerificationModule {}
