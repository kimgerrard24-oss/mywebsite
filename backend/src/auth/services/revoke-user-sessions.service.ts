// backend/src/auth/services/revoke-user-sessions.service.ts

import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RevokeUserSessionsService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  async revokeAll(userId: string) {
    await this.redis.revokeAllSessionsByUser(userId);
  }
}
