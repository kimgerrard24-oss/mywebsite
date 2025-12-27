// backend/src/chat/chat-permission.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatPermissionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ตรวจว่า viewer สามารถคุยกับ target ได้หรือไม่
   * - block
   * - privacy
   * (fail-closed)
   */
  async canChat(
    viewerUserId: string,
    targetUserId: string,
  ): Promise<boolean> {
    // example: block check
    const blocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          {
            blockerId: viewerUserId,
            blockedId: targetUserId,
          },
          {
            blockerId: targetUserId,
            blockedId: viewerUserId,
          },
        ],
      },
    });

    if (blocked) return false;

    // privacy rules สามารถเพิ่มภายหลัง
    return true;
  }

  async assertUserActive(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { active: true, isDisabled: true },
    });

    if (!user || !user.active || user.isDisabled) {
      throw new ForbiddenException(
        'User is not allowed to access chat',
      );
    }
  }

  /**
   * ตรวจว่า viewer สามารถเข้าถึง chat นี้ได้หรือไม่
   * (ใช้กับ GET /chat/:chatId, GET messages, PATCH, DELETE)
   */
  async assertCanAccessChat(params: {
    chat: any;
    viewerUserId: string;
  }): Promise<void> {
    const { chat, viewerUserId } = params;

    if (!chat) {
      throw new ForbiddenException('Chat not found');
    }

    const participant = chat.participants.find(
      (p: any) => p.userId === viewerUserId,
    );

    if (!participant) {
      throw new ForbiddenException('Access denied');
    }

    const user = participant.user;
    if (!user || !user.active || user.isDisabled) {
      throw new ForbiddenException('Access denied');
    }
  }

  /**
   * ==============================
   * Read Permission
   * ==============================
   * รองรับ:
   * POST /chat/:chatId/read
   */
  async assertCanReadChat(params: {
    chat: any;
    viewerUserId: string;
  }): Promise<void> {
    // reuse rule เดิมแบบ 100%
    await this.assertCanAccessChat(params);
  }

  /**
   * ==============================
   * NEW: Unread Count Permission
   * ==============================
   * รองรับ:
   * GET /chat/:chatId/unread-count
   *
   * - ต้องเป็น participant
   * - user ต้อง active
   * - ไม่ต้องเป็น sender
   * - fail-closed
   *
   * ❗ ใช้ rule เดียวกับ assertCanAccessChat
   * ❗ แยก method เพื่อ semantic ชัดเจน
   */
  async assertCanViewUnreadCount(params: {
    chat: any;
    viewerUserId: string;
  }): Promise<void> {
    // unread-count = read-scope
    await this.assertCanAccessChat(params);
  }
}
