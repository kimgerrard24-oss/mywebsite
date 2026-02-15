// backend/src/chat/chat.service.ts
import { 
  Injectable, 
  ForbiddenException,
  NotFoundException,
 } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { ChatPermissionService } from './chat-permission.service';
import { ChatRoomDto } from './dto/chat-room.dto';
import { ChatRoomListDto } from './dto/chat-room-list.dto';
import { ChatMetaDto } from './dto/chat-meta.dto';
import { ChatMessageListDto } from './dto/chat-message-list.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { mapUnreadCount } from './mapper/chat-unread.mapper';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationRealtimeService } from '../notifications/realtime/notification-realtime.service';
import { ChatRealtimeService } from './realtime/chat-realtime.service'
import { ChatMessageRepository } from './chat-message.repository';
import { AuditService } from '../auth/audit.service'
import { ChatRoomDisplayDto } from './dto/chat-room-display.dto'

@Injectable()
export class ChatService {
  constructor(
    private readonly repo: ChatRepository,
    private readonly permission: ChatPermissionService,
    private readonly notifications: NotificationsService,
    private readonly notificationRealtime: NotificationRealtimeService,
    private readonly chatRealtime: ChatRealtimeService, 
    private readonly chatMessageRepo: ChatMessageRepository,
    private readonly audit: AuditService,
  ) {}

  async getOrCreateDirectChat(params: {
    viewerUserId: string;
    targetUserId: string;
  }): Promise<ChatRoomDto> {
    const { viewerUserId, targetUserId } = params;

    if (viewerUserId === targetUserId) {
      throw new ForbiddenException('Cannot chat with yourself');
    }

    // 1) permission check (block / privacy)
    const allowed = await this.permission.canChat(
      viewerUserId,
      targetUserId,
    );

    if (!allowed) {
      throw new ForbiddenException('Chat is not allowed');
    }

    // 2) find existing chat
    let chat = await this.repo.findDirectChat(
  viewerUserId,
  targetUserId,
);

let isNew = false;

if (!chat) {
  chat = await this.repo.createDirectChat(
    viewerUserId,
    targetUserId,
  );
  isNew = true;
}

if (isNew) {
  try {
  await this.audit.createLog({
    userId: viewerUserId,
    action: 'chat.start',
    success: true,
    targetId: targetUserId,
  });
} catch {}

}


    return ChatRoomDto.fromEntity(chat, {
      viewerUserId,
    });
  }

   async getChatRooms(
    viewerUserId: string,
  ): Promise<ChatRoomListDto[]> {
    // permission hook (future: archived / muted)
    await this.permission.assertUserActive(viewerUserId);

    const rooms = await this.repo.findChatRoomsByUser(
      viewerUserId,
    );

    return rooms.map((row) =>
      ChatRoomListDto.fromRow(row, {
        viewerUserId,
      }),
    );
  }

  async getChatMeta(params: {
    chatId: string;
    viewerUserId: string;
  }): Promise<ChatMetaDto> {
    const { chatId, viewerUserId } = params;

    // 1. Load chat + participants
    const chat = await this.repo.findChatMeta(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // 2. Permission (fail-closed)
    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId,
    });

    try {
  await this.audit.createLog({
    userId: viewerUserId,
    action: 'chat.view_meta',
    success: true,
    targetId: chatId,
  });
} catch {}



    // 3. Map to DTO
    return ChatMetaDto.fromChat(chat, {
      viewerUserId,
    });
  }

  async getMessages(params: {
    chatId: string;
    viewerUserId: string;
    cursor: string | null;
    limit: number;
  }): Promise<ChatMessageListDto> {
    const { chatId, viewerUserId, cursor, limit } =
      params;

    // 1. Load chat (existence check)
    const chat = await this.repo.findChatById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // 2. Permission (fail-closed)
    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId,
    });

    await this.repo.upsertReadState({
      chatId,
      userId: viewerUserId,
    });

    // 3. Load messages
    const rows = await this.repo.findMessages({
      chatId,
      cursor,
      limit,
    });

   try {
  await this.audit.createLog({
    userId: viewerUserId,
    action: 'chat.view_messages',
    success: true,
    targetId: chatId,
  });
} catch {}


    return ChatMessageListDto.fromRows(rows, {
      limit,
      viewerUserId,
    });
  }

async sendMessage(params: {
  chatId: string;
  senderUserId: string;
  content?: string;
  mediaIds?: string[];
}): Promise<ChatMessageDto> {
  const { chatId, senderUserId, content, mediaIds } = params;

  // 1) Load chat
  const chat = await this.repo.findChatById(chatId);
  if (!chat) {
    throw new NotFoundException('Chat not found');
  }

  // 2) Permission (participant + active + block)
  await this.permission.assertCanAccessChat({
    chat,
    viewerUserId: senderUserId,
  });

  // 3) Validate payload (must have content or media)
  const hasContent =
    typeof content === 'string' &&
    content.trim().length > 0;

  const hasMedia =
    Array.isArray(mediaIds) &&
    mediaIds.length > 0;

  if (!hasContent && !hasMedia) {
    throw new ForbiddenException(
      'Message must contain text or media',
    );
  }

  // 4) Create message (authoritative)
  const message = await this.repo.createMessage({
    chatId,
    senderUserId,
    content: hasContent ? content!.trim() : null,
  });

  // 5) Attach media (fail-soft)
  if (hasMedia) {
    await this.chatMessageRepo.attachMediaToMessage({
      messageId: message.id,
      mediaIds: mediaIds!,
    });
  }

  /**
   * 6) Reload message with media (AUTHORITATIVE SNAPSHOT)
   * - retry once (fail-soft) to avoid async media race
   */
  let fullMessage =
    await this.chatMessageRepo.findMessageById({
      chatId,
      messageId: message.id,
    });

  if (
    hasMedia &&
    fullMessage &&
    Array.isArray(fullMessage.media) &&
    fullMessage.media.length === 0
  ) {
    // small delay before retry (non-blocking, production-safe)
    await new Promise((r) => setTimeout(r, 50));

    const retry =
      await this.chatMessageRepo.findMessageById({
        chatId,
        messageId: message.id,
      });

    if (retry) {
      fullMessage = retry;
    }
  }

  try {
  await this.audit.createLog({
    userId: senderUserId,
    action: 'chat.send_message',
    success: true,
    targetId: message.id,
    metadata: {
      chatId,
      hasText: hasContent,
      hasMedia,
    },
  });
} catch {}


  // 7) Realtime emit (delivery only, fail-soft)
  try {
    this.chatRealtime.emitNewMessage({
  chatId,
  message: ChatMessageDto.fromRow(
    fullMessage,
    senderUserId, // viewer = sender
  ),
});

  } catch {
    // realtime must never break message send
  }

  /**
   * 7.5) 🔔 Chat → Notification bridge (fail-soft)
   * - backend authority only
   * - do NOT block message send
   * - do NOT spam (DM only)
   */
  try {
 if (!chat.isGroup) {
  const recipients = chat.participants
    .map((p) => p.userId)
    .filter(
      (id) =>
        typeof id === 'string' &&
        id.length > 0 &&
        id !== senderUserId,
    );

  for (const recipientId of recipients) {
    await this.notifications.createNotification({
      userId: recipientId,
      actorUserId: senderUserId,
      type: 'chat_message',
      entityId: chatId,
      payload: {
        chatId,
        messageId: message.id,
      },
    });
  }
}

} catch {
    // notification must never break chat send
  }

  // 8) Return authoritative response
  return ChatMessageDto.fromRow(
  fullMessage,
  senderUserId,
);

}



   async getUnreadCount(params: {
  chatId: string;
  viewerUserId: string;
}) {
  const { chatId, viewerUserId } = params;

  // 1) Load chat + participants (existence check)
  const chat =
    await this.repo.findChatWithParticipants(chatId);

  // 2) Permission (fail-soft for unread badge)
  try {
    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId,
    });
  } catch {
    /**
     * 🔒 If blocked / no longer allowed:
     * - Do NOT throw (badge polling should not error-spam)
     * - Treat as 0 unread
     */
    return mapUnreadCount(0);
  }

  // 3) Count unread messages (authoritative)
  const count =
    await this.repo.countUnreadMessages({
      chatId,
      userId: viewerUserId,
    });

  return mapUnreadCount(count);
}

  
async getChatRoomDisplays(
  viewerUserId: string,
) {
  await this.permission.assertUserActive(
    viewerUserId,
  );

  const rooms =
    await this.repo.findChatRoomsByUser(
      viewerUserId,
    );

  return rooms.map((row) =>
    ChatRoomDisplayDto.fromRow(
      row,
      viewerUserId,
    ),
  );
}
}
