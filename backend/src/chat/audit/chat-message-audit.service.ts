// backend/src/chat/audit/chat-message-audit.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatMessageAuditService {
  async recordDelete(params: {
    messageId: string;
    chatId: string;
    actorUserId: string;
    reason?: string;
  }) {
    // 🔒 production:
    // - write to audit log table
    // - or send to queue / SIEM
    // ตอนนี้เก็บ hook ไว้ก่อน (fail-soft)
    return;
  }
}
