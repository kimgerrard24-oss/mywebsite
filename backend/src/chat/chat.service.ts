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

@Injectable()
export class ChatService {
  constructor(
    private readonly repo: ChatRepository,
    private readonly permission: ChatPermissionService,
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
    content: string;
  }): Promise<ChatMessageDto> {
    const { chatId, senderUserId, content } = params;

    // 1. Load chat
    const chat = await this.repo.findChatById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // 2. Permission (participant + active + block)
    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId: senderUserId,
    });

    // 3. Create message
    const message = await this.repo.createMessage({
      chatId,
      senderUserId,
      content,
    });

    return ChatMessageDto.fromRow(message);
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
