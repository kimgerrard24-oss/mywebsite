// backend/src/chat/chat-messages.controller.ts

import {
  Body,
  Controller,
  Param,
  Post,
  Patch,
  Delete,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { ChatMessagesService } from './chat-messages.service';
import { EditChatMessageDto } from './dto/edit-chat-message.dto';
import { DeleteChatMessageDto } from './dto/delete-chat-message.dto';

@Controller('chat')
@UseGuards(AccessTokenCookieAuthGuard)
export class ChatMessagesController {
  constructor(
    private readonly service: ChatMessagesService,
  ) {}

  @Patch(':chatId/messages/:messageId')
  async editMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() dto: EditChatMessageDto,
    @Req() req: Request,
  ) {
    const viewerUserId = (req as any).user.userId;

    return this.service.editMessage({
      chatId,
      messageId,
      viewerUserId,
      content: dto.content,
    });
  }

  @Delete(':chatId/messages/:messageId')
  async deleteMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() dto: DeleteChatMessageDto,
    @Req() req: Request,
  ) {
    const viewerUserId = (req as any).user.userId;

    return this.service.deleteMessage({
      chatId,
      messageId,
      viewerUserId,
      reason: dto.reason,
    });
  }

   @Post(':chatId/read')
  @UseGuards(AccessTokenCookieAuthGuard)
  @HttpCode(204)
  async markChatAsRead(
    @Param('chatId') chatId: string,
    @Req() req: Request & { user: { userId: string } },
  ): Promise<void> {
    const viewerUserId = req.user.userId;

    await this.service.markChatAsRead({
      chatId,
      viewerUserId,
    });
  }
}
