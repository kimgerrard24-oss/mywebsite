// backend/src/following/following.module.ts
import { Module } from '@nestjs/common';
import { FollowingController } from './following.controller';
import { FollowingService } from './following.service';
import { FollowingRepository } from './following.repository';
import { FollowingMapper } from './mapper/following.mapper';
import { FollowingCacheService } from './cache/following-cache.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ AuthModule ],
  controllers: [FollowingController],
  providers: [
    FollowingService,
    FollowingRepository,
    FollowingMapper,
    FollowingCacheService,
  ],
})
export class FollowingModule {}
