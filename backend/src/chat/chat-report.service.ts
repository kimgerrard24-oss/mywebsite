// backend/src/chat/chat-report.service.ts
import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { ChatPermissionService } from './chat-permission.service';
import { ChatReportRepository } from './chat-report.repository';
import { ChatReportReason } from '@prisma/client';

@Injectable()
export class ChatReportService {
  constructor(
    private readonly chatRepo: ChatRepository,
    private readonly permission: ChatPermissionService,
    private readonly reportRepo: ChatReportRepository,
  ) {}

  async reportChat(params: {
    chatId: string;
    reporterUserId: string;
    reason: ChatReportReason;
    description?: string;
  }) {
    const chat = await this.chatRepo.getChatOrFail(
      params.chatId,
    );

    await this.permission.assertCanAccessChat({
      chat,
      viewerUserId: params.reporterUserId,
    });

    return this.reportRepo.create({
      chatId: chat.id,
      reporterId: params.reporterUserId,
      reason: params.reason,
      description: params.description,
    });
  }
}
