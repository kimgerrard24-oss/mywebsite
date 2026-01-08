// backend/src/chat/audit/chat-message-audit.service.ts

import { Injectable } from '@nestjs/common';
import { AuditService } from '../../auth/audit.service';

@Injectable()
export class ChatMessageAuditService {
   
  constructor(
    private readonly audit: AuditService,
  ) {}
 
  // =========================
  // DELETE MESSAGE
  // =========================
  async recordDelete(params: {
    messageId: string;
    chatId: string;
    actorUserId: string;
    reason?: string;
  }) {
    await this.audit.createLog({
      userId: params.actorUserId,
      action: 'chat.message.delete',
      success: true,
      targetId: params.messageId,
      metadata: {
        chatId: params.chatId,
        reason: params.reason ?? null,
      },
    });
  }

  // =========================
  // EDIT MESSAGE ✅ NEW
  // =========================
  async recordEdit(params: {
    messageId: string;
    chatId: string;
    actorUserId: string;
  }) {
    await this.audit.createLog({
      userId: params.actorUserId,
      action: 'chat.message.edit',
      success: true,
      targetId: params.messageId,
      metadata: {
        chatId: params.chatId,
      },
    });
  }
}
