// backend/src/chat/chat.controller.ts
import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { ChatRoomDto } from './dto/chat-room.dto';
import { ChatRoomListDto } from './dto/chat-room-list.dto';
import { ChatMetaDto } from './dto/chat-meta.dto';
import { ChatMessageListDto } from './dto/chat-message-list.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatRealtimeService } from './realtime/chat-realtime.service';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatRealtime: ChatRealtimeService,
  ) {}

  @UseGuards(AccessTokenCookieAuthGuard)
  @Get('rooms')
  async getChatRooms(
    @Req() req: Request,
  ): Promise<ChatRoomListDto[]> {
    const viewer = req.user as { userId: string; jti: string };

    return this.chatService.getChatRooms(viewer.userId);
  }

  /**
   * GET /chat/:userId
   * - เปิดห้องแชต 1–1
   */
  @UseGuards(AccessTokenCookieAuthGuard)
  @Get(':userId')
  async getChatByUserId(
    @Param('userId') targetUserId: string,
    @Req() req: Request,
  ): Promise<ChatRoomDto> {
    const viewer = req.user as { userId: string; jti: string };

    return this.chatService.getOrCreateDirectChat({
      viewerUserId: viewer.userId,
      targetUserId,
    });
  }

  @UseGuards(AccessTokenCookieAuthGuard)
  @Get(':chatId/meta')
  async getChatMeta(
    @Req() req: Request,
    @Param('chatId') chatId: string,
  ): Promise<ChatMetaDto> {
    const viewer = req.user as { userId: string; jti: string };

    return this.chatService.getChatMeta({
      chatId,
      viewerUserId: viewer.userId,
    });
  }

  /**
   * GET /chat/:chatId/messages
   */
  @UseGuards(AccessTokenCookieAuthGuard)
  @Get(':chatId/messages')
  @RateLimit('messagingSend')
  async getMessages(
    @Req() req: Request,
    @Param('chatId') chatId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<ChatMessageListDto> {
    const viewer = req.user as { userId: string; jti: string };

    return this.chatService.getMessages({
      chatId,
      viewerUserId: viewer.userId,
      cursor: cursor ?? null,
      limit: Math.min(Number(limit) || 30, 50),
    });
  }

  /**
   * POST /chat/:chatId/messages
   * - รองรับ text / image / voice
   */
 @UseGuards(AccessTokenCookieAuthGuard)
@Post(':chatId/messages')
async sendMessage(
  @Req() req: Request,
  @Param('chatId') chatId: string,
  @Body() body: CreateChatMessageDto,
): Promise<ChatMessageDto> {
  const viewer = req.user as {
    userId: string;
    jti: string;
  };

  const message = await this.chatService.sendMessage({
    chatId,
    senderUserId: viewer.userId,
    content: body.content,        // ✅ ไม่ใช้ ?? null
    mediaIds: body.mediaIds,
  });

  return message;
 }

  @UseGuards(AccessTokenCookieAuthGuard)
  @Get(':chatId/unread-count')
  async getUnreadCount(
    @Param('chatId') chatId: string,
    @Req() req: any,
  ) {
    const viewerUserId = req.user.userId;

    return this.chatService.getUnreadCount({
      chatId,
      viewerUserId,
    });
  }

  @UseGuards(AccessTokenCookieAuthGuard)
@Get('rooms/display')
async getChatRoomDisplays(
  @Req() req: Request,
) {
  const viewer = req.user as {
    userId: string;
  };

  return this.chatService.getChatRoomDisplays(
    viewer.userId,
  );
}
}
