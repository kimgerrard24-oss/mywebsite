// backend/src/media/media.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PresignService } from './presign/presign.service';
import { R2Module } from '../r2/r2.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MediaRepository } from './media.repository';
import { MediaCleanupCron } from './cron/media-cleanup.cron';
import { PostsVisibilityModule } from '../posts/visibility/posts-visibility.module';

@Module({
  imports: [
    R2Module,
    PrismaModule,
    AuthModule, 
    PostsVisibilityModule,
  ],
  controllers: [MediaController],
  providers: [
    MediaService, 
    MediaRepository, 
    MediaCleanupCron, 
    PresignService,
  ],
})
export class MediaModule {}
