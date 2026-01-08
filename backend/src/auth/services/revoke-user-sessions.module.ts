// backend/src/auth/services/revoke-user-sessions.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { RevokeUserSessionsService } from './revoke-user-sessions.service';
import { RedisModule } from '../../redis/redis.module';
import { AuthModule } from '../auth.module';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => AuthModule), 
  ],
  providers: [RevokeUserSessionsService],
  exports: [RevokeUserSessionsService], 
})
export class RevokeUserSessionsModule {}
