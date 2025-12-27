// backend/src/chat/chat-report.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatReportReason } from '@prisma/client';

@Injectable()
export class ChatReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(params: {
    chatId: string;
    reporterId: string;
    reason: ChatReportReason;
    description?: string;
  }) {
    return this.prisma.chatReport.create({
      data: {
        chatId: params.chatId,
        reporterId: params.reporterId,
        reason: params.reason,
        description: params.description,
      },
    });
  }
}
