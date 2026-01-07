// frontend/src/types/report.ts

export type ReportTargetType =
  | "POST"
  | "COMMENT"
  | "USER"
  | "CHAT_MESSAGE";

/**
 * ===== Target Snapshot (read-only evidence) =====
 * - Provided by backend only
 * - Frontend must not infer or compute state
 * - Used for User Report Detail & Admin Review UX
 */
export type ReportTargetSnapshot =
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
      stats?: {
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
      post?: {
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

