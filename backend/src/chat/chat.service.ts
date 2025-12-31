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
import { NotificationMapper } from '../notifications/mapper/notification.mapper';
import { ChatRealtimeService } from './realtime/chat-realtime.service'
import { ChatMessageRepository } from './chat-message.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly repo: ChatRepository,
    private readonly permission: ChatPermissionService,
    private readonly notifications: NotificationsService,
    private readonly notificationRealtime: NotificationRealtimeService,
    private readonly chatRealtime: ChatRealtimeService, 
    private readonly chatMessageRepo: ChatMessageRepository,
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

    // 3) create if not exists
    if (!chat) {
      chat = await this.repo.createDirectChat(
        viewerUserId,
        targetUserId,
      );
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

    // 3. Load messages
    const rows = await this.repo.findMessages({
      chatId,
      cursor,
      limit,
    });

    return ChatMessageListDto.fromRows(rows, {
      limit,
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

  // 7) Realtime emit (delivery only, fail-soft)
  try {
    this.chatRealtime.emitNewMessage({
      chatId,
      message: ChatMessageDto.fromRow(fullMessage),
    });
  } catch {
    // realtime must never break message send
  }

  // 8) Return authoritative response
  return ChatMessageDto.fromRow(fullMessage);
}


   async getUnreadCount(params: {
    chatId: string;
    viewerUserId: string;
  }) {
    const { chatId, viewerUserId } = params;

    // โหลด chat + participants
    const chat =
      await this.repo.findChatWithParticipants(
        chatId,
      );

    // permission (fail-closed)
    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId,
    });

    const count =
      await this.repo.countUnreadMessages({
        chatId,
        userId: viewerUserId,
      });

    return mapUnreadCount(count);
  }
  
}
