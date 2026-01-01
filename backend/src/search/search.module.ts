// backend/src/search/search.module.ts

import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchPostsRepository } from './search-posts.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchUsersRepository } from './search-users.repository';
import { SearchTagsRepository } from './search-tags.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [SearchController],
  providers: [
    SearchService, 
    SearchPostsRepository, 
    SearchUsersRepository,
    SearchTagsRepository,
  ],
})
export class SearchModule {}
