// frontend/src/types/admin-report.ts

export type ReportStatus =
  | "PENDING"
  | "REVIEWED"
  | "ACTION_TAKEN"
  | "REJECTED";

export type ReportTargetType =
  | "POST"
  | "COMMENT"
  | "USER"
  | "CHAT_MESSAGE";

export type AdminReportItem = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
    displayName: string | null;
  };
};

export type AdminReportListResponse = {
  items: AdminReportItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

export type AdminReportQuery = {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  page?: number;
  limit?: number;
};

export type AdminReportDetail = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  createdAt: string;

  reporter: {
    id: string;
    username: string;
    displayName: string | null;
  };

  resolvedByAdmin?: {
    id: string;
    username: string;
    displayName: string | null;
  } | null;

  resolvedAt?: string | null;
  resolutionNote?: string | null;
};