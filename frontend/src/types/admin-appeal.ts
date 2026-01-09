// frontend/src/types/admin-appeal.ts

export type AdminAppealItem = {
  id: string;
  userId: string;

  targetType: string;
  targetId: string;

  status: string;
  reason: string;

  createdAt: string;
  resolvedAt: string | null;
};

export type AdminAppealsResponse = {
  items: AdminAppealItem[];
  nextCursor: string | null;
};

export type AppealStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type AppealTargetType =
  | 'POST'
  | 'COMMENT'
  | 'USER';

export type ModerationActionType =
  | 'HIDE'
  | 'UNHIDE'
  | 'BAN'
  | 'UNBAN'
  | 'DELETE';

export type AdminAppealDetail = {
  id: string;
  userId: string;

  targetType: AppealTargetType;
  targetId: string;

  status: AppealStatus;

  reason: string;
  detail: string | null;

  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;

  moderationAction?: {
    id: string;
    actionType: ModerationActionType;
    targetType: string;
    targetId: string;
    reason: string;
    createdAt: string;
  } | null;

  report?: {
    id: string;
    reason: string;
    createdAt: string;
  } | null;
};
