// backend/src/chat/chat-permission.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatPermissionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ตรวจว่า viewer สามารถเริ่มแชทกับ target ได้หรือไม่
   * - block (2 ทาง)
   * - privacy (future)
   * (fail-closed)
   */
  async canChat(
    viewerUserId: string,
    targetUserId: string,
  ): Promise<boolean> {
    // ===== BLOCK CHECK (2-way) =====
    const blocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: viewerUserId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: viewerUserId },
        ],
      },
      select: { blockerId: true },
    });

    if (blocked) return false;

    // ===== FUTURE: privacy rules =====
    return true;
  }

  /**
   * ตรวจว่า user ยัง active และไม่ถูก disable
   */
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
   *
   * Enforcement:
   * - must be participant
   * - viewer must be active
   * - must NOT be blocked (2-way) in DM
   * (fail-closed)
   */
  async assertCanAccessChat(params: {
    chat: any;
    viewerUserId: string;
  }): Promise<void> {
    const { chat, viewerUserId } = params;

    if (!chat || !Array.isArray(chat.participants)) {
      throw new ForbiddenException('Access denied');
    }

    // ===== participant check =====
    const participant = chat.participants.find(
      (p: any) => p.userId === viewerUserId,
    );

    if (!participant) {
      throw new ForbiddenException('Access denied');
    }

    const viewer = participant.user;
    if (!viewer || !viewer.active || viewer.isDisabled) {
      throw new ForbiddenException('Access denied');
    }

    // ===== DM block enforcement =====
    // group chat: skip block enforcement (future: group policy)
    if (!chat.isGroup) {
      const other = chat.participants.find(
        (p: any) => p.userId !== viewerUserId,
      );

      if (!other?.userId) {
        throw new ForbiddenException('Access denied');
      }

      await this.assertNotBlockedBetween({
        userA: viewerUserId,
        userB: other.userId,
      });
    }
  }

  /**
   * ==============================
   * Read Permission
   * ==============================
   */
  async assertCanReadChat(params: {
    chat: any;
    viewerUserId: string;
  }): Promise<void> {
    await this.assertCanAccessChat(params);
  }

  /**
   * ==============================
   * Unread Count Permission
   * ==============================
   */
  async assertCanViewUnreadCount(params: {
    chat: any;
    viewerUserId: string;
  }): Promise<void> {
    await this.assertCanAccessChat(params);
  }

  // =====================================================
  // 🔒 INTERNAL: Block Enforcement (2-way)
  // =====================================================
  private async assertNotBlockedBetween(params: {
    userA: string;
    userB: string;
  }): Promise<void> {
    const { userA, userB } = params;

    const blocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userA, blockedId: userB },
          { blockerId: userB, blockedId: userA },
        ],
      },
      select: { blockerId: true },
    });

    if (blocked) {
      throw new ForbiddenException(
        'Chat is not allowed due to block relationship',
      );
    }
  }
}

