// frontend/src/types/appeal.ts

export type AppealTargetType =
  | "POST"
  | "COMMENT"
  | "USER"
  | "CHAT_MESSAGE";

export type AppealStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";


export type Appeal = {
  id: string;
  targetType: AppealTargetType;
  targetId: string;
  status: AppealStatus;
  reason: string;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
};

export type MyAppealDetail = {
  id: string;
  targetType: 'POST' | 'COMMENT' | 'USER' | 'CHAT_MESSAGE';
  targetId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  reason: string;
  detail: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
};