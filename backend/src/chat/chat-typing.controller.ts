// backend/src/chat/chat-typing.controller.ts
import {
  Controller,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { ChatTypingService } from './chat-typing.service';
import { ChatRepository } from './chat.repository';
import { ChatPermissionService } from './chat-permission.service';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';

@Controller('chat')
export class ChatTypingController {
  constructor(
    private readonly chatTypingService: ChatTypingService,
    private readonly chatRepo: ChatRepository,
    private readonly permission: ChatPermissionService,
  ) {}

  @Post(':chatId/typing')
  @RateLimit('chatTyping')
  @UseGuards(AccessTokenCookieAuthGuard)
  async typing(
    @Param('chatId') chatId: string,
    @Body() body: { isTyping: boolean },
    @Req() req: any,
  ) {
    const viewerUserId = req.user.userId;

    const chat = await this.chatRepo.getChatOrFail(chatId);

    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId,
    });

    await this.chatTypingService.sendTyping({
      chat,
      viewerUserId,
      isTyping: body.isTyping === true,
    });

    return { ok: true };
  }
}
