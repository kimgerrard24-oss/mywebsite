// backend/src/media/media.module.ts
import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PresignService } from './presign/presign.service';
import { R2Module } from '../r2/r2.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    R2Module,
    PrismaModule,
    AuthModule, 
  ],
  controllers: [MediaController],
  providers: [MediaService, PresignService],
})
export class MediaModule {}
