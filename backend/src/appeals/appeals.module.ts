// backend/src/appeals/appeals.module.ts

import { Module } from '@nestjs/common';
import { AppealsController } from './appeals.controller';
import { AppealsService } from './appeals.service';
import { AppealsRepository } from './appeals.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppealsController],
  providers: [AppealsService, AppealsRepository],
})
export class AppealsModule {}
