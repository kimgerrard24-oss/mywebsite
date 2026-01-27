// backend/src/chat/chat-report.controller.ts
import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatReportService } from './chat-report.service';
import { CreateChatReportDto } from './dto/create-chat-report.dto';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';

@Controller('chat')
@UseGuards(AccessTokenCookieAuthGuard)
export class ChatReportController {
  constructor(
    private readonly reportService: ChatReportService,
  ) {}

  @Post(':chatId/report')
  @RateLimit('reportCreate')
  async reportChat(
    @Param('chatId') chatId: string,
    @Body() dto: CreateChatReportDto,
    @CurrentUser() user: { userId: string },
  ) {
    await this.reportService.reportChat({
      chatId,
      reporterUserId: user.userId,
      reason: dto.reason,
      description: dto.description,
    });

    return { success: true };
  }
}
