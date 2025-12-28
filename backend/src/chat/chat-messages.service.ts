// backend/src/chat/chat-messages.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatMessageRepository } from './chat-message.repository';
import { ChatPermissionService } from './chat-permission.service';
import { ChatMessageMapper } from './mapper/chat-message.mapper';
import { ChatMessageAuditService } from './audit/chat-message-audit.service';
import { ChatRealtimeService } from './realtime/chat-realtime.service';

@Injectable()
export class ChatMessagesService {
  constructor(
    private readonly repo: ChatMessageRepository,
    private readonly permission: ChatPermissionService,
    private readonly audit: ChatMessageAuditService,
    private readonly chatRealtime: ChatRealtimeService,
  ) {}

  async editMessage(params: {
    chatId: string;
    messageId: string;
    viewerUserId: string;
    content: string;
  }) {
    const { chatId, messageId, viewerUserId, content } = params;

    const message = await this.repo.findMessageForEdit({
      chatId,
      messageId,
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // sender only
    if (message.senderId !== viewerUserId) {
      throw new ForbiddenException('Cannot edit this message');
    }

    // sender still active
    await this.permission.assertUserActive(
      message.senderId,
    );

    const updated = await this.repo.updateMessage({
      messageId,
      content,
    });

    return ChatMessageMapper.toEditedResponse(updated);
  }

 async deleteMessage(params: {
  chatId: string;
  messageId: string;
  viewerUserId: string;
  reason?: string;
}) {
  const {
    chatId,
    messageId,
    viewerUserId,
    reason,
  } = params;

  const message = await this.repo.findForDelete({
    chatId,
    messageId,
  });

  if (!message) {
    throw new NotFoundException('Message not found');
  }

  // only sender can delete
  if (message.senderId !== viewerUserId) {
    throw new ForbiddenException(
      'Cannot delete this message',
    );
  }

  // sender must still be active
  await this.permission.assertUserActive(
    message.senderId,
  );

  const deleted = await this.repo.softDelete(
    messageId,
  );

  // audit (fail-soft)
  try {
    await this.audit.recordDelete({
      messageId,
      chatId,
      actorUserId: viewerUserId,
      reason,
    });
  } catch {
    // audit fail must not break delete
  }

  // 🔔 CHAT REALTIME DELETE (fail-soft)
  try {
    this.chatRealtime.emitMessageDeleted({
      chatId,
      messageId,
    });
  } catch {
    // realtime fail must not break delete
  }

  return ChatMessageMapper.toEditedResponse(
    deleted,
  );
}


   async markChatAsRead(params: {
    chatId: string;
    viewerUserId: string;
  }): Promise<void> {
    const { chatId, viewerUserId } = params;

    /**
     * 1) load chat (minimal)
     */
    const chat = await this.repo.findChatForRead(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    /**
     * 2) permission check (fail-closed)
     */
    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId,
    });

    /**
     * 3) find last message id (optional but recommended)
     */
    const lastMessage =
      await this.repo.findLastMessage(chatId);

    /**
     * 4) upsert read state
     */
    await this.repo.upsertReadState({
      chatId,
      userId: viewerUserId,
      lastReadMessageId: lastMessage?.id ?? null,
    });
  }
}
