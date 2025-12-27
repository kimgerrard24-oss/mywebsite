// frontend/src/types/chat-report.ts

export enum ChatReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE = 'hate',
  SEXUAL = 'sexual',
  OTHER = 'other',
}

export type ChatReportPayload = {
  reason: ChatReportReason;
  description?: string;
};
