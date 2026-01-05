// backend/src/admin/dashboard/dto/admin-dashboard.dto.ts

export class AdminDashboardDto {
  system!: {
    userCount: number;
    postCount: number;
    commentCount: number;
  };

  moderation!: {
    pendingReports: number;
    disabledUsers: number;
  };
}

