// backend/src/auth/services/revoke-user-sessions.module.ts

import { Module } from '@nestjs/common';
import { RevokeUserSessionsService } from './revoke-user-sessions.service';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [
    RedisModule, 
  ],
  providers: [RevokeUserSessionsService],
  exports: [RevokeUserSessionsService], 
})
export class RevokeUserSessionsModule {}
