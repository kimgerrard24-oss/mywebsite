// frontend/src/types/chat-report.ts

export enum ChatReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  HATE = 'HATE',
  SEXUAL = 'SEXUAL',
  OTHER = 'OTHER',
}


export type ChatReportPayload = {
  reason: ChatReportReason;
  description?: string;
};
