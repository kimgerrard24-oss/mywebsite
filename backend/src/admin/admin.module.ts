// backend/src/admin/admin.module.ts

import { Module } from '@nestjs/common';

import { AdminReportsModule } from './report/admin-reports.module';
import { AdminPostsModule } from './posts/admin-posts.module';
import { AdminCommentsModule } from './comments/admin-comments.module';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminModerationModule } from './moderation/admin-moderation.module';
import { AdminActionsModule } from './actions/admin-actions.module';

@Module({
  imports: [
    AdminReportsModule,
    AdminPostsModule,
    AdminCommentsModule,
    AdminUsersModule,
    AdminDashboardModule,
    AdminModerationModule,
    AdminActionsModule,
  ],
})
export class AdminModule {}
