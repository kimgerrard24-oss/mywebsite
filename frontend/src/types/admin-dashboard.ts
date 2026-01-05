// frontend/src/types/admin-dashboard.ts

export type AdminDashboardData = {
  system: {
    userCount: number;
    postCount: number;
    commentCount: number;
  };

  moderation: {
    pendingReports: number;
    disabledUsers: number;
  };
};
