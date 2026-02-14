// backend/src/profile/profile-media.module.ts

import { Module } from '@nestjs/common';
import { ProfileMediaController } from './profile-media.controller';
import { ProfileMediaService } from './profile-media.service';
import { ProfileMediaRepository } from './profile-media.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../users/audit/audit.module';
import { R2Module } from '../r2/r2.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    PrismaModule, 
    AuditModule, 
    R2Module,
    UsersModule,
    AuthModule,
    PostsModule,
  ],
  controllers: [ProfileMediaController],
  providers: [
    ProfileMediaService, 
    ProfileMediaRepository,
  ],
  exports: [ProfileMediaRepository],
})
export class ProfileMediaModule {}
