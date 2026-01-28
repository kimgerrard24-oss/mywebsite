// backend/src/shares/share-links/share-links.module.ts

import { Module } from '@nestjs/common';

import { ShareLinksController } from './share-links.controller';
import { ShareLinksService } from './share-links.service';
import { ShareLinksRepository } from './share-links.repository';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
      PrismaModule, 
      AuthModule,
      ShareLinksModule,
    ],
  controllers: [ShareLinksController],
  providers: [
    ShareLinksService,
    ShareLinksRepository,
  ],
})
export class ShareLinksModule {}
