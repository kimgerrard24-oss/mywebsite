// frontend/src/types/admin-report.ts

export type ReportStatus =
  | "PENDING"
  | "REVIEWED"
  | "ACTION_TAKEN"
  | "REJECTED"
  | "WITHDRAWN";

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

  /**
   * ===== Target state (UX helper only) =====
   * Backend is authority
   */
  target?: {
    isHidden?: boolean;
    isDeleted?: boolean;
  };

  /**
   * ===== Target snapshot (Admin evidence view) =====
   * Read-only, backend-authoritative
   */
  targetSnapshot?:
    | {
        type: "POST";
        id: string;
        content: string;
        createdAt: string;
        isHidden: boolean;
        isDeleted: boolean;
        deletedSource?: string | null;
        author: {
          id: string;
          username: string;
          displayName: string | null;
        };
        stats: {
          commentCount: number;
          likeCount: number;
        };
      }
    | {
        type: "COMMENT";
        id: string;
        content: string;
        createdAt: string;
        isHidden: boolean;
        isDeleted: boolean;
        author: {
          id: string;
          username: string;
          displayName: string | null;
        };
        post: {
          id: string;
        };
      }
    | {
        type: "USER";
        id: string;
        username: string;
        displayName: string | null;
        createdAt: string;
        isDisabled: boolean;
      }
    | {
        type: "CHAT_MESSAGE";
        id: string;
        content: string;
        createdAt: string;
        isDeleted: boolean;
        sender: {
          id: string;
          username: string;
          displayName: string | null;
        };
      };
};
