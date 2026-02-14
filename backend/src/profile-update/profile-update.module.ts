// backend/src/profile-update/profile-update.module.ts

import { Module } from '@nestjs/common';
import { ProfileUpdateController } from './profile-update.controller';
import { ProfileUpdateService } from './profile-update.service';
import { ProfileUpdateRepository } from './profile-update.repository';
import { ProfileUpdateTransaction } from './profile-update.transaction';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../users/audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    AuditModule,
  ],
  controllers: [ProfileUpdateController],
  providers: [
    ProfileUpdateService,
    ProfileUpdateRepository,
    ProfileUpdateTransaction,
  ],
})
export class ProfileUpdateModule {}
