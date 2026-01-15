// backend/src/securities/securities.module.ts

import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { SecurityRepository } from './security.repository';
import { RevokeUserSessionsService } from'../auth/services/revoke-user-sessions.service';
import { RedisModule } from '../redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../users/audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { CredentialVerificationModule } from '../auth/credential-verification.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    AuditModule,
    CredentialVerificationModule,
  ],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    SecurityRepository,
    RevokeUserSessionsService,
  ],
  exports: [
    RevokeUserSessionsService, 
  ],
})
export class SecuritiesModule {}
