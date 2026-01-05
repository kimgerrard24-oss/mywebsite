// backend/src/admin/actions/admin-actions.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminActionsController } from './admin-actions.controller';
import { AdminActionsService } from './admin-actions.service';
import { AdminActionsRepository } from './admin-actions.repository';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [ AuthModule, PrismaModule, ],
  controllers: [AdminActionsController],
  providers: [
    AdminActionsService,
    AdminActionsRepository,
  ],
})
export class AdminActionsModule {}

